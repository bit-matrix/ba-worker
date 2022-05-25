import { TxDetail } from "@bitmatrix/esplora-api-client";
import { getAsset } from "../../helper/getAsset";
import { div, isUniqueArray } from "../../helper/util";
import { convertion } from "@script-wiz/lib-core";
import WizData from "@script-wiz/wiz-data";

const lbtcAsset = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
const usdtAsset = "f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958";

export const isPoolRegisteryWorker = async (newTxDetail: TxDetail): Promise<boolean> => {
  console.log("Is pool registery worker started");

  // maximum 7 output
  if (newTxDetail.vout.length > 7) return false;

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

  if (!newTxDetail.vout[0].asset) return false;
  const mayPoolAssetId = newTxDetail.vout[0].asset;
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
  if (!newTxDetail.vout[2].asset) return false;
  const mayLPAssetId = newTxDetail.vout[2].asset;
  const lpAsset = await getAsset(mayLPAssetId);
  if (lpAsset === undefined) return false;
  if (lpAsset.chain_stats.issued_amount !== 2000000000) return false;
  if (lpAsset.chain_stats.reissuance_tokens !== 0) return false;

  /*
   *İkinci parite (token covenant) asset ID’ sinin L-BTC ya da USDt olmadığını kontrol et (bu bir L-BTC<>USDt havuzu ise istisna).
   *
   */

  // if (newTxDetail.vin[2].prevout?.asset !== lbtcAsset && (newTxDetail.vin[3].prevout?.asset === usdtAsset) return false;

  /*
   *
   *
   */
  const opreturnOutput = newTxDetail.vout[newTxDetail.vout.length - 1];

  if (opreturnOutput.scriptpubkey_type !== "op_return") return false;

  const outputHex = opreturnOutput.scriptpubkey.slice(4);

  if (outputHex.length !== 28) return false;

  const bitmatrixHex = outputHex.slice(0, 18);
  const version = outputHex.slice(18, 20);
  const pair1_coefficient = outputHex.slice(20);

  if (bitmatrixHex !== "6269746d6174726978") return false;
  if (version !== "01") return false;

  if (pair1_coefficient === "14000000" && newTxDetail.vin[2].prevout?.asset !== lbtcAsset) return false;
  if (pair1_coefficient === "40420f00" && newTxDetail.vin[2].prevout?.asset !== usdtAsset) return false;

  if (!newTxDetail.vout[2].value) return false;
  const lpCirculation = 2000000000 - newTxDetail.vout[2].value; // 10000

  const pair1Amount = newTxDetail.vin[1].prevout?.value;

  const pair1Div = div(pair1Amount || 0, convertion.LE32ToNum(WizData.fromHex(pair1_coefficient)).number || 0 * 5);

  if (pair1Div != lpCirculation || lpCirculation < 50) return false;

  return true;
};
