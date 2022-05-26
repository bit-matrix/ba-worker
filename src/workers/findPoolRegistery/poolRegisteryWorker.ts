import { TxDetail } from "@bitmatrix/esplora-api-client";
import { getAsset } from "../../helper/getAsset";
import { div, isUniqueArray } from "../../helper/util";
import { convertion, taproot, TAPROOT_VERSION } from "@script-wiz/lib-core";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { pool } from "@bitmatrix/lib";

const lbtcAsset = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
const usdtAsset = "f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958";

export const isPoolRegisteryWorker = async (newTxDetail: TxDetail): Promise<boolean> => {
  console.log("Is pool registery worker started");

  // 4 input - 7 output
  if (newTxDetail.vout.length !== 7) return false;
  if (newTxDetail.vin.length !== 4) return false;

  // first 4 outputs asset ids must be different
  const firtOutputAssets = newTxDetail.vout.slice(0, 4).map((out) => out.asset);
  const areOutputAssetsDifferent = isUniqueArray(firtOutputAssets);
  if (!areOutputAssetsDifferent) return false;

  /*
   * Step 1:
   * İlk outputta taşınan asset ID (örnekte a701f8c859cfcda6e5232935f50569174b425cd458d1fcf74d1e43537f45fd69) ‘nin
   * toplam sirkülasyonunun “1” olduğunu ve reissuance tokens’ının olmadığını kontrol edelim.
   *
   */
  const flagOutput = newTxDetail.vout[0];

  if (!flagOutput.asset) return false;
  const mayPoolAssetId = flagOutput.asset;
  const poolAsset = await getAsset(mayPoolAssetId);

  if (poolAsset === undefined) return false;
  if (poolAsset.chain_stats.issued_amount !== 1) return false;
  if (poolAsset.chain_stats.reissuance_tokens !== 0) return false;

  /*
   * Step 2:
   * Üçüncü outputta taşınan LP assetinin (örnekte 382470f8970154abc97374f8ec63a2b2852814e0dffc2339dfa6057aa5747e84)
   * toplam sirkülasyonunun “2,000,000,000” olduğunu ve reissuance tokens’ının olmadığını kontrol edelim.
   *
   */

  const mayLP = newTxDetail.vout[2];
  if (!mayLP.asset) return false;

  const lpAsset = await getAsset(mayLP.asset || " ");

  if (lpAsset === undefined) return false;
  if (lpAsset.chain_stats.issued_amount !== 2000000000) return false;
  if (lpAsset.chain_stats.reissuance_tokens !== 0) return false;

  const pair1 = newTxDetail.vout[3];
  const pair2 = newTxDetail.vout[1];

  /*
   *İkinci parite (token covenant) asset ID’ sinin L-BTC ya da USDt olmadığını kontrol et (bu bir L-BTC<>USDt havuzu ise istisna).
   *
   */

  if (pair2.asset === lbtcAsset || pair2.asset === usdtAsset) {
    if (pair1.asset !== lbtcAsset && pair2.asset !== usdtAsset) return false;
  }

  /*
   *
   *
   */
  const opreturnOutput = newTxDetail.vout[newTxDetail.vout.length - 2];

  if (opreturnOutput.scriptpubkey_type !== "op_return") return false;

  const outputHex = opreturnOutput.scriptpubkey.slice(4);

  if (outputHex.length !== 28) return false;

  const bitmatrixHex = outputHex.slice(0, 18);

  const version = outputHex.slice(18, 20);
  let leafCount = 0;

  if (version === "01") {
    leafCount = 1;
  } else if (version === "02") {
    leafCount = 16;
  }

  const pair1_coefficient = outputHex.slice(20);

  if (bitmatrixHex !== "6269746d6174726978") return false;
  if (version !== "01") return false;

  if (pair1_coefficient === "14000000" && pair1.asset !== lbtcAsset) return false;
  if (pair1_coefficient === "40420f00" && pair1.asset !== usdtAsset) return false;

  if (!mayLP.value) return false;
  const lpCirculation = 2000000000 - mayLP.value; // 10000
  const pair1_coefficientNumber = convertion.LE32ToNum(WizData.fromHex(pair1_coefficient)).number || 0;

  const pair1Div = div(pair1.value || 0, pair1_coefficientNumber * 5);

  if (pair1Div != lpCirculation || lpCirculation < 50) return false;

  const script = [WizData.fromHex("20" + hexLE(mayPoolAssetId || "") + "00c86987")];
  const pubkey = WizData.fromHex("1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624");

  const flagCovenantScriptPubkey = "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55";
  const tokenCovenantScriptPubkey = taproot.tapRoot(pubkey, script, TAPROOT_VERSION.LIQUID).scriptPubkey.hex;
  const lpHolderCovenantScriptPubkey = tokenCovenantScriptPubkey;
  const mainCovenantScriptPubkey = pool.createCovenants(leafCount - 1, 0, mayPoolAssetId, pair1_coefficientNumber).taprootResult.scriptPubkey.hex;

  if (flagOutput.scriptpubkey !== flagCovenantScriptPubkey) return false;
  if (pair2.scriptpubkey !== tokenCovenantScriptPubkey) return false;
  if (mayLP.scriptpubkey !== lpHolderCovenantScriptPubkey) return false;
  if (pair1.scriptpubkey !== mainCovenantScriptPubkey) return false;

  return true;
};
