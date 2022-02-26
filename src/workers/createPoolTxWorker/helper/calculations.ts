import { BmConfig, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { toHex64BE } from "./common";
import { recipientValueCases } from "./recipientValueCases";

const calculateUserRecipientData = (
  qouteAssetLE: string,
  tokenAssetLE: string,
  lpAssetLE: string,

  quoteSupply: number,
  tokenSupply: number,
  lpSupply: number,

  callData: CallData,

  recipientValueMinus: number
): {
  quoteSupply: number;
  tokenSupply: number;
  lpSupply: number;

  userRecipientScriptPubkey: string;
  userRecipientAssetLE1: string;
  userRecipientValueHex1: string;
  userRecipientAssetLE2: string;
  userRecipientValueHex2: string;
  isOutOfSlippage: boolean;
} => {
  const result = {
    quoteSupply: quoteSupply,
    tokenSupply: tokenSupply,
    lpSupply: lpSupply,

    userRecipientScriptPubkey: callData.recipientPublicKey,
    userRecipientAssetLE1: "",
    userRecipientValueHex1: "",
    userRecipientAssetLE2: "",
    userRecipientValueHex2: "",

    isOutOfSlippage: false,
  };

  // Case 1
  if (callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    const { recipientValueNumber: recipientValueTokenNumber } = recipientValueCases(
      callData.method,
      quoteSupply,
      tokenSupply,
      lpSupply,
      callData.value.quote,
      0,
      recipientValueMinus
    );

    const slippageTolerance = Number(callData.slippageTolerance);
    const isOutOfSlippage: boolean = recipientValueTokenNumber < slippageTolerance;
    if (isOutOfSlippage) {
      result.isOutOfSlippage = true;

      const recipientValueQuoteNumber = callData.value.quote;

      const userQuoteReceivedFirstHalfNumber: number = Math.floor(recipientValueQuoteNumber / 2);
      const userQuoteReceivedSecondHalfNumber: number = recipientValueQuoteNumber - userQuoteReceivedFirstHalfNumber;
      if (userQuoteReceivedFirstHalfNumber < 500) throw new Error("isOutOfSlippage: userQuoteReceivedFirstHalfNumber is not gte 500");
      const userQuoteReceivedFirstHalf = toHex64BE(userQuoteReceivedFirstHalfNumber);
      const userQuoteReceivedSecondHalf = toHex64BE(userQuoteReceivedSecondHalfNumber);

      result.userRecipientAssetLE1 = qouteAssetLE;
      result.userRecipientValueHex1 = userQuoteReceivedFirstHalf;
      result.userRecipientAssetLE2 = qouteAssetLE;
      result.userRecipientValueHex2 = userQuoteReceivedSecondHalf;
    } else {
      const userTokenReceivedFirstHalfNumber: number = Math.floor(recipientValueTokenNumber / 2);
      const userTokenReceivedSecondHalfNumber: number = recipientValueTokenNumber - userTokenReceivedFirstHalfNumber;
      if (userTokenReceivedFirstHalfNumber < 500) throw new Error("userTokenReceivedFirstHalfNumber is not gte 500");
      const userTokenReceivedFirstHalf = toHex64BE(userTokenReceivedFirstHalfNumber);
      const userTokenReceivedSecondHalf = toHex64BE(userTokenReceivedSecondHalfNumber);

      result.userRecipientAssetLE1 = tokenAssetLE;
      result.userRecipientValueHex1 = userTokenReceivedFirstHalf;
      result.userRecipientAssetLE2 = tokenAssetLE;
      result.userRecipientValueHex2 = userTokenReceivedSecondHalf;

      result.quoteSupply = result.quoteSupply + callData.value.quote;
      result.tokenSupply = result.tokenSupply - recipientValueTokenNumber;
    }
  }
  // Case 2
  else if (callData.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
    const { recipientValueNumber: recipientValueQuoteNumber } = recipientValueCases(callData.method, quoteSupply, tokenSupply, lpSupply, callData.value.token);

    const slippageTolerance = Number(callData.slippageTolerance);
    const isOutOfSlippage: boolean = recipientValueQuoteNumber < slippageTolerance;
    if (isOutOfSlippage) {
      result.isOutOfSlippage = true;
      const recipientValueTokenNumber = callData.value.token;

      const userTokenReceivedFirstHalfNumber: number = Math.floor(recipientValueTokenNumber / 2);
      const userTokenReceivedSecondHalfNumber: number = recipientValueTokenNumber - userTokenReceivedFirstHalfNumber;
      if (userTokenReceivedFirstHalfNumber < 500) throw new Error("isOutOfSlippage: userTokenReceivedFirstHalfNumber is not gte 500");
      const userTokenReceivedFirstHalf = toHex64BE(userTokenReceivedFirstHalfNumber);
      const userTokenReceivedSecondHalf = toHex64BE(userTokenReceivedSecondHalfNumber);

      result.userRecipientAssetLE1 = tokenAssetLE;
      result.userRecipientValueHex1 = userTokenReceivedFirstHalf;
      result.userRecipientAssetLE2 = tokenAssetLE;
      result.userRecipientValueHex2 = userTokenReceivedSecondHalf;
    } else {
      const userQuoteReceivedFirstHalfNumber: number = Math.floor(recipientValueQuoteNumber / 2);
      const userQuoteReceivedSecondHalfNumber: number = recipientValueQuoteNumber - userQuoteReceivedFirstHalfNumber;
      if (userQuoteReceivedFirstHalfNumber < 500) throw new Error("userQuoteReceivedFirstHalfNumber is not gte 500");
      const userQuoteReceivedFirstHalf = toHex64BE(userQuoteReceivedFirstHalfNumber);
      const userQuoteReceivedSecondHalf = toHex64BE(userQuoteReceivedSecondHalfNumber);

      result.userRecipientAssetLE1 = qouteAssetLE;
      result.userRecipientValueHex1 = userQuoteReceivedFirstHalf;
      result.userRecipientAssetLE2 = qouteAssetLE;
      result.userRecipientValueHex2 = userQuoteReceivedSecondHalf;

      result.quoteSupply = result.quoteSupply - recipientValueQuoteNumber;
      result.tokenSupply = result.tokenSupply + callData.value.token;
    }
  }
  // Case 3
  else if (callData.method === CALL_METHOD.ADD_LIQUIDITY) {
    const { recipientValueNumber: recipientValueLpNumber } = recipientValueCases(callData.method, quoteSupply, tokenSupply, lpSupply, callData.value.quote, callData.value.token);

    const userLpReceivedFirstHalfNumber: number = Math.floor(recipientValueLpNumber / 2);
    const userLpReceivedSecondHalfNumber: number = recipientValueLpNumber - userLpReceivedFirstHalfNumber;
    const userLpReceivedFirstHalf = toHex64BE(userLpReceivedFirstHalfNumber);
    const userLpReceivedSecondHalf = toHex64BE(userLpReceivedSecondHalfNumber);

    result.userRecipientAssetLE1 = lpAssetLE;
    result.userRecipientValueHex1 = userLpReceivedFirstHalf;
    result.userRecipientAssetLE2 = lpAssetLE;
    result.userRecipientValueHex2 = userLpReceivedSecondHalf;

    result.quoteSupply = result.quoteSupply + callData.value.quote;
    result.tokenSupply = result.tokenSupply + callData.value.token;
    result.lpSupply = result.lpSupply - recipientValueLpNumber;
  }
  // Case 4
  else if (callData.method === CALL_METHOD.REMOVE_LIQUIDITY) {
    const { recipientValueNumber: recipientValueQuoteNumber, recipientValueNumber2: recipientValueTokenNumber } = recipientValueCases(
      callData.method,
      quoteSupply,
      tokenSupply,
      lpSupply,
      callData.value.lp
    );

    const recipientValueQuote = toHex64BE(recipientValueQuoteNumber);
    const recipientValueToken = toHex64BE(recipientValueTokenNumber);

    result.userRecipientAssetLE1 = qouteAssetLE;
    result.userRecipientValueHex1 = recipientValueQuote;
    result.userRecipientAssetLE2 = tokenAssetLE;
    result.userRecipientValueHex2 = recipientValueToken;

    result.quoteSupply = result.quoteSupply - recipientValueQuoteNumber;
    result.tokenSupply = result.tokenSupply - recipientValueTokenNumber;
    result.lpSupply = result.lpSupply + callData.value.lp;
  }

  return result;
};

export const calculateUserRecipientDatas = (
  qouteAssetLE: string,
  tokenAssetLE: string,
  lpAssetLE: string,

  quoteSupplyp: number,
  tokenSupplyp: number,
  lpSupplyp: number,

  poolConfig: BmConfig,
  callDatas: CallData[]
): {
  quoteSupply: string;
  tokenSupply: string;
  lpSupply: string;

  userRecipients: {
    scriptPubkey: string;
    assetLE1: string;
    valueHex1: string;
    assetLE2: string;
    valueHex2: string;
    isOutOfSlippage: boolean;
  }[];
} => {
  const resultNumber: {
    quoteSupply: number;
    tokenSupply: number;
    lpSupply: number;

    userRecipients: {
      scriptPubkey: string;
      assetLE1: string;
      valueHex1: string;
      assetLE2: string;
      valueHex2: string;
      isOutOfSlippage: boolean;
    }[];
  } = {
    quoteSupply: quoteSupplyp,
    tokenSupply: tokenSupplyp,
    lpSupply: lpSupplyp,

    userRecipients: [],
  };

  callDatas.forEach((callData) => {
    const {
      quoteSupply,
      tokenSupply,
      lpSupply,
      userRecipientScriptPubkey,
      userRecipientAssetLE1,
      userRecipientValueHex1,
      userRecipientAssetLE2,
      userRecipientValueHex2,
      isOutOfSlippage,
    } = calculateUserRecipientData(
      qouteAssetLE,
      tokenAssetLE,
      lpAssetLE,
      resultNumber.quoteSupply,
      resultNumber.tokenSupply,
      resultNumber.lpSupply,
      callData,
      poolConfig.recipientValueMinus
    );

    resultNumber.quoteSupply = quoteSupply;
    resultNumber.tokenSupply = tokenSupply;
    resultNumber.lpSupply = lpSupply;

    resultNumber.userRecipients.push({
      scriptPubkey: userRecipientScriptPubkey,
      assetLE1: userRecipientAssetLE1,
      valueHex1: userRecipientValueHex1,
      assetLE2: userRecipientAssetLE2,
      valueHex2: userRecipientValueHex2,
      isOutOfSlippage,
    });
  });

  return {
    quoteSupply: toHex64BE(resultNumber.quoteSupply),
    tokenSupply: toHex64BE(resultNumber.tokenSupply),
    lpSupply: toHex64BE(resultNumber.lpSupply),

    userRecipients: resultNumber.userRecipients,
  };
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
