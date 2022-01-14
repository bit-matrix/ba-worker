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

  const leafFees = [145, 355, 630, 970, 1375, 1845, 2380, 2980, 3645, 4375, 5170, 6030, 6955, 7945, 9000, 10120];

  // sum of the all ctx ordering fees
  const totalOrderingFees = orderingFees.reduce((p, c) => p + c, 0);

  // formula
  const txFeeValue = totalOrderingFees + leafFees[callDatas.length - 1];

  // base fee mul ctx count
  const totalBaseFees = baseFee * callDatas.length;

  // service fee mul ctx count
  const totalServiceFee = serviceFee * callDatas.length;

  const serviceCommissionValue = totalServiceFee + totalBaseFees + totalOrderingFees - txFeeValue;

  return { serviceCommissionValueHex: toHex64BE(serviceCommissionValue), txFeeValueHex: toHex64BE(txFeeValue) };
};
