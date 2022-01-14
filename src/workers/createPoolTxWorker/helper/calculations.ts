import { BmConfig, CallData, Pool } from "@bitmatrix/models";

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

  // TODO

  return result;
};
