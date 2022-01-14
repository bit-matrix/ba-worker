import { BmConfig, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { toHex64BE } from "./common";

const quotePrecisionCoefficient = 16;
const tokenPrecisionCoefficient = 2000000;

const recipientValueCase1 = (quoteSupply: number, tokenSupply: number, quoteValue: number, recipientValueMinus: number): number => {
  /*
   *
   * Method: 01 // QUOTE FRO TOKEN
   *
   * %0.25 LP feesini hesaplıycaz
   * 1. 5000 / 400 = 12 *** a
   * 2. 5000 - 12 = 4988   *** b
   * 3. POOL_LBTC_VALUE_LATEST_STATE + 4988 = 1004988  *** c
   * 4. 1004988 / 16 = 62811 *** d
   * 5. POOL_LBTC_VALUE_LATEST_STATE / 16 = 62500 *** e
   * 6. POOL_TOKEN_VALUE_LATEST_STATE / 2000000 = 25000 *** f
   * 7. 62500 * 25000 = 1562500000 *** g
   * 8. 1562500000 / 62811 = 24876 *** h
   * 9. 24876 * 2000000 = 49752000000 *** i
   * 10. POOL_TOKEN_VALUE_LATEST_STATE - 49752000000 = 248000000 *** j
   * 11. 248000000 - 1000000 = 247000000 *** k
   */

  const a = Math.floor(quoteValue / 500);
  // console.log("a", a);
  const b = quoteValue - a;
  // console.log("b", b);
  const c = Number(quoteSupply) + b;
  // console.log("c", c);
  const d = Math.floor(c / quotePrecisionCoefficient);
  // console.log("d", d);
  const e = Math.floor(Number(quoteSupply) / quotePrecisionCoefficient);
  // console.log("e", e);
  const f = Math.floor(Number(tokenSupply) / tokenPrecisionCoefficient);
  // console.log("f", f);
  const g = e * f;
  // console.log("g", g);
  const h = Math.floor(g / d);
  // console.log("h", h);
  const i = h * tokenPrecisionCoefficient;
  // console.log("i", i);
  const j = Number(tokenSupply) - i;
  // console.log("j", j);
  const k = j - recipientValueMinus; // 3000000
  // console.log("k", k);

  return k;
};

const recipientValueCase2 = (quoteSupply: number, tokenSupply: number, tokenValue: number): number => {
  /**
   * Method 02
   * Swap USDT for LBTC:
   * Kutuya 20000000000 tether yazdım
   *
   * 1. kutudaki tether değeri 50000000 den büyük ya da eşit olmalı
   * 2. 20000000000 / 400 = 50000000 *** a
   * 3. 20000000000 - 50000000 = 19950000000 *** b
   * 3. POOL_TOKEN_VALUE_LATEST_STATE + 19950000000 = 69950000000 *** c
   * 4. 69950000000 / 2000000 = 34975 *** d
   * 5. POOL_LBTC_VALUE_LATEST_STATE / 16 = 62500 *** e
   * 6. POOL_TOKEN_VALUE_LATEST_STATE / 2000000 = 25000 *** f
   * 7. 62500 * 25000 = 1562500000 *** g
   * 8. 1562500000 / 34975 = 44674 *** h
   * 9. 44674 *16 = 714784 *** i
   * 10. POOL_LBTC_VALUE_LATEST_STATE - 714784 = 285216 *** j
   */
  const a = Math.floor(tokenValue / 500);
  // console.log("a", a);
  const b = tokenValue - a;
  // console.log("b", b);
  const c = Number(tokenSupply) + b;
  // console.log("c", c);
  const d = Math.floor(c / tokenPrecisionCoefficient);
  // console.log("d", d);
  const e = Math.floor(Number(quoteSupply) / quotePrecisionCoefficient);
  // console.log("e", e);
  const f = Math.floor(Number(tokenSupply) / tokenPrecisionCoefficient);
  // console.log("f", f);
  const g = e * f;
  // console.log("g", g);
  const h = Math.floor(g / d);
  // console.log("h", h);
  const i = h * quotePrecisionCoefficient;
  // console.log("i", i);
  const j = Number(quoteSupply) - i;
  // console.log("j", j);

  return j;
};

const recipientValueCase3 = (quoteSupply: number, tokenSupply: number, lpSupply: number, valueQuote: number, valueToken: number): number => {
  const user_provided_remaining_lbtc_supply = valueQuote;
  const user_provided_remaining_lbtc_supply_16 = Math.floor(user_provided_remaining_lbtc_supply / 16);

  const pool_lp_supply = Number(lpSupply);
  const pool_lp_circulation = 2000000000 - pool_lp_supply;
  const mul_circ = user_provided_remaining_lbtc_supply_16 * pool_lp_circulation;
  const pool_lbtc_supply = Number(quoteSupply);
  const pool_lbtc_supply_down = Math.floor(pool_lbtc_supply / 16);

  const user_lp_receiving_1 = Math.floor(mul_circ / pool_lbtc_supply_down);

  const user_provided_token_supply = valueToken;
  const user_provided_token_supply_down = Math.floor(user_provided_token_supply / 2000000);
  const mul_circ2 = user_provided_token_supply_down * pool_lp_circulation;
  const pool_token_supply = Number(tokenSupply);
  const pool_token_supply_down = Math.floor(pool_token_supply / 2000000);

  const user_lp_receiving_2 = Math.floor(mul_circ2 / pool_token_supply_down);
  const user_lp_received = Math.min(user_lp_receiving_1, user_lp_receiving_2);

  return user_lp_received;
};

const recipientValueCase4 = (
  quoteSupply: number,
  tokenSupply: number,
  lpSupply: number,
  lpValue: number
): { recipientValueQuoteNumber: number; recipientValueTokenNumber: number } => {
  const user_lp_input = lpValue;
  const pool_lbtc_supply = Number(quoteSupply);
  const pool_token_supply = Number(tokenSupply);
  const pool_lp_supply = Number(lpSupply);

  const pool_lbtc_supply_down = Math.floor(pool_lbtc_supply / 16);
  const mul_1 = user_lp_input * pool_lbtc_supply_down;
  const lp_circ = 2000000000 - pool_lp_supply;
  const div_1 = Math.floor(mul_1 / lp_circ);

  const user_quote_received = div_1 * 16;

  const pool_token_supply_down = Math.floor(pool_token_supply / 2000000);

  const mul_2 = user_lp_input * pool_token_supply_down;
  const div_2 = Math.floor(mul_2 / lp_circ);
  const user_token_received = div_2 * 2000000;

  if (user_quote_received < 500) throw new Error("user_quote_received is not gte 500");

  return { recipientValueQuoteNumber: user_quote_received, recipientValueTokenNumber: user_token_received };
};

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
  };

  // Case 1
  if (callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    const recipientValueNumber = recipientValueCase1(quoteSupply, tokenSupply, callData.value.quote, recipientValueMinus);

    const userTokenReceivedFirstHalfNumber: number = Math.floor(recipientValueNumber / 2);
    const userTokenReceivedSecondHalfNumber: number = recipientValueNumber - userTokenReceivedFirstHalfNumber;
    if (userTokenReceivedFirstHalfNumber < 500) throw new Error("userTokenReceivedFirstHalfNumber is not gte 500");
    const userTokenReceivedFirstHalf = toHex64BE(userTokenReceivedFirstHalfNumber);
    const userTokenReceivedSecondHalf = toHex64BE(userTokenReceivedSecondHalfNumber);

    result.userRecipientAssetLE1 = tokenAssetLE;
    result.userRecipientValueHex1 = userTokenReceivedFirstHalf;
    result.userRecipientAssetLE2 = tokenAssetLE;
    result.userRecipientValueHex2 = userTokenReceivedSecondHalf;

    result.quoteSupply = result.quoteSupply + callData.value.quote;
    result.tokenSupply = result.tokenSupply - recipientValueNumber;

    return result;
  }
  // Case 2
  else if (callData.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
    const recipientValueNumber = recipientValueCase2(quoteSupply, tokenSupply, callData.value.token);

    const userQuoteReceivedFirstHalfNumber: number = Math.floor(recipientValueNumber / 2);
    const userQuoteReceivedSecondHalfNumber: number = recipientValueNumber - userQuoteReceivedFirstHalfNumber;
    if (userQuoteReceivedFirstHalfNumber < 500) throw new Error("userQuoteReceivedFirstHalfNumber is not gte 500");
    const userQuoteReceivedFirstHalf = toHex64BE(userQuoteReceivedFirstHalfNumber);
    const userQuoteReceivedSecondHalf = toHex64BE(userQuoteReceivedSecondHalfNumber);

    result.userRecipientAssetLE1 = qouteAssetLE;
    result.userRecipientValueHex1 = userQuoteReceivedFirstHalf;
    result.userRecipientAssetLE2 = qouteAssetLE;
    result.userRecipientValueHex2 = userQuoteReceivedSecondHalf;

    result.quoteSupply = result.quoteSupply - recipientValueNumber;
    result.tokenSupply = result.tokenSupply - callData.value.token;
  }
  // Case 3
  else if (callData.method === CALL_METHOD.ADD_LIQUIDITY) {
    const recipientValueNumber = recipientValueCase3(quoteSupply, tokenSupply, lpSupply, callData.value.quote, callData.value.token);

    const userLpReceivedFirstHalfNumber: number = Math.floor(recipientValueNumber / 2);
    const userLpReceivedSecondHalfNumber: number = recipientValueNumber - userLpReceivedFirstHalfNumber;
    const userLpReceivedFirstHalf = toHex64BE(userLpReceivedFirstHalfNumber);
    const userLpReceivedSecondHalf = toHex64BE(userLpReceivedSecondHalfNumber);

    result.userRecipientAssetLE1 = lpAssetLE;
    result.userRecipientValueHex1 = userLpReceivedFirstHalf;
    result.userRecipientAssetLE2 = lpAssetLE;
    result.userRecipientValueHex2 = userLpReceivedSecondHalf;

    result.quoteSupply = result.quoteSupply + callData.value.quote;
    result.tokenSupply = result.tokenSupply + callData.value.token;
    result.lpSupply = result.lpSupply - recipientValueNumber;
  }
  // Case 4
  else if (callData.method === CALL_METHOD.REMOVE_LIQUIDITY) {
    const { recipientValueQuoteNumber, recipientValueTokenNumber } = recipientValueCase4(quoteSupply, tokenSupply, lpSupply, callData.value.lp);

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
    }[];
  } = {
    quoteSupply: quoteSupplyp,
    tokenSupply: tokenSupplyp,
    lpSupply: lpSupplyp,

    userRecipients: [],
  };

  callDatas.forEach((callData) => {
    const { quoteSupply, tokenSupply, lpSupply, userRecipientScriptPubkey, userRecipientAssetLE1, userRecipientValueHex1, userRecipientAssetLE2, userRecipientValueHex2 } =
      calculateUserRecipientData(
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
    });
  });

  return {
    quoteSupply: toHex64BE(resultNumber.quoteSupply),
    tokenSupply: toHex64BE(resultNumber.tokenSupply),
    lpSupply: toHex64BE(resultNumber.lpSupply),

    userRecipients: resultNumber.userRecipients,
  };
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
