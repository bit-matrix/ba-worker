import { BmConfig, CallData, Pool } from "@bitmatrix/models";
import { toHex64BE } from "./common";

export const calculateUserRecipientDatas = (
  pool: Pool,
  poolConfig: BmConfig,
  callDatas: CallData[]
): {
  userRecipientScriptPubkey: string;
  userRecipientAssetLE1: string;
  userRecipientValueHex1: string;
  userRecipientAssetLE2: string;
  userRecipientValueHex2: string;
}[] => {
  const result: {
    userRecipientScriptPubkey: string;
    userRecipientAssetLE1: string;
    userRecipientValueHex1: string;
    userRecipientAssetLE2: string;
    userRecipientValueHex2: string;
  }[] = [];

  // TODO

  return result;
};

export const calculateNewPoolValues = (/* TODO */): { newPoolTokenValueHex: string; newPoolLpValueHex: string; newPoolQuoteValueHex: string } => {
  const result: { newPoolTokenValueHex: string; newPoolLpValueHex: string; newPoolQuoteValueHex: string } = {
    newPoolTokenValueHex: "",
    newPoolLpValueHex: "",
    newPoolQuoteValueHex: "",
  };

  // TODO

  return result;
};

export const calculateServiceCommissionValueHexTxFeeValueHex = (
  baseFee: number,
  serviceFee: number,
  callDatas: CallData[]
): { serviceCommissionValueHex: string; txFeeValueHex: string } => {
  const orderingFees: number[] = callDatas.map((c) => c.orderingFee);
  const result: { serviceCommissionValueHex: string; txFeeValueHex: string } = { serviceCommissionValueHex: "", txFeeValueHex: "" };

  // sum base fee +  all ordering fees
  const totalFee = baseFee + orderingFees.reduce((p, c) => p + c, 0);

  const x = Math.floor(totalFee / 3);
  const txFeeValue = Math.floor(x + (2 * x) / (16 * callDatas.length));
  const txFeeValueHex = toHex64BE(txFeeValue);

  const remainingTxFee = totalFee - txFeeValue;
  const serviceCommissionValue = serviceFee + remainingTxFee;
  const serviceCommissionValueHex = toHex64BE(serviceCommissionValue);

  result.txFeeValueHex = txFeeValueHex;
  result.serviceCommissionValueHex = serviceCommissionValueHex;

  return result;
};
