import { TxDetail } from "@bitmatrix/esplora-api-client";
import { getAsset } from "../../helper/getAsset";
import { div, isUniqueArray, tickerFinder } from "../../helper/util";
import { convertion, taproot, TAPROOT_VERSION } from "@script-wiz/lib-core";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { pool } from "@bitmatrix/lib";
import { BmChart, BmTxInfo, PAsset, Pool } from "@bitmatrix/models";
import { poolTxHistorySave, poolUpdate } from "../../business/db-client";
import { tokenPriceCalculation } from "../../helper/tokenPriceCalculation";

export const isPoolRegistery = async (newTxDetail: TxDetail): Promise<boolean> => {
  console.log("Is pool registery worker started");

  // --------------------------- POOL VALIDATION ---------------------------------

  // 4 input - 7 output
  if (newTxDetail.vout.length !== 7) return false;
  if (newTxDetail.vin.length !== 4) return false;

  const innerPublicKey = "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624";

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
   *
   *
   */
  const opreturnOutput = newTxDetail.vout[newTxDetail.vout.length - 2];

  if (opreturnOutput.scriptpubkey_type !== "op_return") return false;

  const outputHex = opreturnOutput.scriptpubkey.slice(4);

  if (outputHex.length !== 30) return false;

  const bitmatrixHex = outputHex.slice(0, 18);

  const version = outputHex.slice(18, 20);

  const lpTierIndex = outputHex.slice(28, 30);

  let leafCount = 0;

  if (version === "01") {
    leafCount = 64;
  }

  const pair1_coefficient = outputHex.slice(20, 28);

  if (bitmatrixHex !== "6269746d6174726978") return false;
  if (parseInt(hexLE(pair1_coefficient), 16) <= 0) return false;

  if (!mayLP.value) return false;
  const lpCirculation = 2000000000 - mayLP.value; // 10000
  const pair1_coefficientNumber = convertion.LE32ToNum(WizData.fromHex(pair1_coefficient)).number || 0;

  const pair1Div = div(pair1.value || 0, pair1_coefficientNumber * 5);

  if (pair1Div != lpCirculation || lpCirculation < 50) return false;

  const script = [WizData.fromHex("20" + hexLE(mayPoolAssetId || "") + "00c86987")];
  const pubkey = WizData.fromHex(innerPublicKey);

  const flagCovenantScriptPubkey = "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55";
  const tokenCovenantScriptPubkey = taproot.tapRoot(pubkey, script, TAPROOT_VERSION.LIQUID).scriptPubkey.hex;
  const lpHolderCovenantScriptPubkey = tokenCovenantScriptPubkey;
  const mainCovenant = pool.createCovenants(leafCount - 1, 0, mayPoolAssetId, pair1_coefficientNumber, WizData.fromHex(lpTierIndex).number || 0);

  if (flagOutput.scriptpubkey !== flagCovenantScriptPubkey) return false;
  if (pair2.scriptpubkey !== tokenCovenantScriptPubkey) return false;
  if (mayLP.scriptpubkey !== lpHolderCovenantScriptPubkey) return false;
  if (pair1.scriptpubkey !== mainCovenant.taprootResult.scriptPubkey.hex) return false;

  // --------------------------- POOL INSERT ---------------------------------

  const quoteTicker = await tickerFinder(pair1.asset || "");
  const tokenTicker = await tickerFinder(pair2.asset || "");
  const lpTicker = await tickerFinder(mayLP.asset || "");

  const quote: PAsset = {
    ticker: quoteTicker.ticker,
    name: quoteTicker.name,
    assetHash: pair1.asset || "",
    value: pair1.value?.toString() || "",
    precision: quoteTicker.precision,
  };

  const token: PAsset = {
    ticker: tokenTicker.ticker,
    name: tokenTicker.name,
    assetHash: pair2.asset || "",
    value: pair2.value?.toString() || "",
    precision: tokenTicker.precision,
  };

  const lPAsset: PAsset = {
    ticker: lpTicker.ticker,
    name: lpTicker.name,
    assetHash: mayLP.asset || "",
    value: mayLP.value?.toString() || "",
    precision: quoteTicker.precision,
  };

  const initialTx: BmTxInfo = {
    txid: newTxDetail.txid,
    block_height: newTxDetail.status.block_height,
    block_hash: newTxDetail.status.block_hash,
  };

  const tokenPrice = tokenPriceCalculation(token, quote);

  const newPool: Pool = {
    id: mayPoolAssetId,
    quote,
    token,
    lp: lPAsset,
    initialTx,
    lastStateTxId: newTxDetail.txid,
    active: true,
    leafCount,
    pair1_coefficient: { hex: pair1_coefficient, number: pair1_coefficientNumber },
    tokenPrice,
    version,
    lpFeeTierIndex: { hex: lpTierIndex, number: WizData.fromHex(lpTierIndex).number || 0 },
  };

  const volumeToken = Number(newPool.token.value);

  const result: BmChart = {
    time: newTxDetail.status.block_time,
    ptxid: newPool.lastStateTxId,
    value: {
      quote: Number(newPool.quote.value),
      token: volumeToken,
      lp: Number(newPool.lp.value),
    },
    price: newPool.tokenPrice,
    volume: {
      token: volumeToken,
      quote: Math.floor(volumeToken / newPool.tokenPrice),
    },
  };

  try {
    await poolUpdate(newPool);

    await poolTxHistorySave(newPool.id, result);
  } catch {
    return false;
  }

  return true;
};
