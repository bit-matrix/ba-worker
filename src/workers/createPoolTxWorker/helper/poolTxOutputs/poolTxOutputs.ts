import { BmConfig, CallData, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { calculateNewPoolValues, calculateServiceCommissionValueHexTxFeeValueHex, calculateUserRecipientDatas } from "../calculations";
import { newPoolOutputs } from "./newPoolOutputs";
import { poolTxTxFeeOutput } from "./poolTxTxFeeOutput";
import { serviceCommissionTxOutput } from "./serviceCommissionTxOutput";
import { usersRecipientTxOutputs } from "./usersRecipientTxOutputs";

export const poolTxOutputs = (pool: Pool, poolConfig: BmConfig, callDatas: CallData[]): string => {
  const poolAssetLE = hexLE(pool.id);
  const tokenAssetLE = hexLE(pool.token.asset);
  const lpAssetLE = hexLE(pool.lp.asset);
  const qouteAssetLE = hexLE(pool.quote.asset);

  const tokenHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.token;
  const lpHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.lp;
  const mainHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.main;

  /**
   * TODO
   */

  const userRecipientDatas = calculateUserRecipientDatas(pool, poolConfig, callDatas);

  const { newPoolTokenValueHex, newPoolLpValueHex, newPoolQuoteValueHex } = calculateNewPoolValues();

  const { serviceCommissionValueHex, txFeeValueHex } = calculateServiceCommissionValueHexTxFeeValueHex(poolConfig.baseFee.number, poolConfig.serviceFee.number, callDatas);

  /**
   * TODO
   */

  const newPoolTxOutputsLength =
    4 + // new pool outputs total length
    2 * callDatas.length + // ctx outputs total length
    1 + // service commission
    1; // tx fee
  const newPoolTxOutputsLengthHex = newPoolTxOutputsLength.toString(16).padStart(2, "0");

  const newPoolOutputsEncoded = newPoolOutputs(
    poolAssetLE,
    tokenAssetLE,
    lpAssetLE,
    qouteAssetLE,
    tokenHolderCovenantScriptPubkey,
    lpHolderCovenantScriptPubkey,
    mainHolderCovenantScriptPubkey,
    newPoolTokenValueHex,
    newPoolLpValueHex,
    newPoolQuoteValueHex
  );

  const usersRecipientTxOutputsEncoded = usersRecipientTxOutputs(userRecipientDatas);

  const serviceCommissionTxOutputEncoded = serviceCommissionTxOutput(pool.quote.asset, serviceCommissionValueHex);

  const poolTxTxFeeOutputEncoded = poolTxTxFeeOutput(pool.quote.asset, txFeeValueHex);

  const poolTxOutputsEncoded = newPoolTxOutputsLengthHex + newPoolOutputsEncoded + usersRecipientTxOutputsEncoded + serviceCommissionTxOutputEncoded + poolTxTxFeeOutputEncoded;

  return poolTxOutputsEncoded;
};
