import { CALL_METHOD } from "@bitmatrix/models";

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

export const recipientValueCases = (
  callMethod: CALL_METHOD,
  quoteSupply: number,
  tokenSupply: number,
  lpSupply: number,
  value: number,
  value2: number = 0,
  recipientValueMinus: number = 0
): { recipientValueNumber: number; recipientValueNumber2: number } => {
  let result = { recipientValueNumber: 0, recipientValueNumber2: 0 };

  // Case 1
  if (callMethod === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    // const recipientValueNumber = recipientValueCase1(quoteSupply, tokenSupply, callData.value.quote, recipientValueMinus);
    const recipientValueNumber = recipientValueCase1(quoteSupply, tokenSupply, value, recipientValueMinus);
    result.recipientValueNumber = recipientValueNumber;
  }
  // Case 2
  else if (callMethod === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
    // const recipientValueNumber = recipientValueCase2(quoteSupply, tokenSupply, callData.value.token);
    const recipientValueNumber = recipientValueCase2(quoteSupply, tokenSupply, value);
    result.recipientValueNumber = recipientValueNumber;
  }
  // Case 3
  else if (callMethod === CALL_METHOD.ADD_LIQUIDITY) {
    // const recipientValueNumber = recipientValueCase3(quoteSupply, tokenSupply, lpSupply, callData.value.quote, callData.value.token);
    const recipientValueNumber = recipientValueCase3(quoteSupply, tokenSupply, lpSupply, value, value2);
    result.recipientValueNumber = recipientValueNumber;
  }
  // Case 4
  else if (callMethod === CALL_METHOD.REMOVE_LIQUIDITY) {
    // const { recipientValueQuoteNumber, recipientValueTokenNumber } = recipientValueCase4(quoteSupply, tokenSupply, lpSupply, callData.value.lp);
    const { recipientValueQuoteNumber, recipientValueTokenNumber } = recipientValueCase4(quoteSupply, tokenSupply, lpSupply, value);
    result.recipientValueNumber = recipientValueQuoteNumber;
    result.recipientValueNumber2 = recipientValueTokenNumber;
  }

  return result;
};
