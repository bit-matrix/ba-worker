import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, CallDataBase, CallDataValue, CALL_METHOD, Pool } from "@bitmatrix/models";

/**
 *
 * https://docs.google.com/document/d/1jz5Reg-0YSME4DjYo6cm9tb_gGSLJsinBL7YI5pRR18/edit?usp=sharing
 *
 */
export const CTX_SCRIPTPUBKEY_BYTE_LENGTH = 34; // getCallDataBase, getCallDataValue

export const getCallDataValue = (pool: Pool, config: BmConfig, callDataBase: CallDataBase, tx: TxDetail): CallDataValue | undefined => {
  const result: CallDataValue = { quote: 0, token: 0, lp: 0 };
  try {
    // 1. check first commitment output’s asset is LBTC
    if (tx.vout[1].asset !== pool.quote.asset) return; // throw new Error("first commitment output's asset is not lbtc");

    // 2.1. check commitment outputs’ scriptpubkeys are equal
    if (tx.vout[1].scriptpubkey !== tx.vout[2].scriptpubkey) return; // throw new Error("commitment outputs' scriptpubkeys are not equal");
    // 2.2. check commitment outputs’ scriptpubkeys byte length is 34
    if (tx.vout[1].scriptpubkey.length !== CTX_SCRIPTPUBKEY_BYTE_LENGTH * 2) return; // throw new Error("commitment outputs' scriptpubkey byte length is not " + CTX_SCRIPTPUBKEY_BYTE_LENGTH * 2);
    // 2.3. check commitment outputs’ scriptpubkeys witness version is 1 (0x51) and pushbytes32 (0x20)
    if (!tx.vout[1].scriptpubkey.startsWith("5120")) return; // throw new Error("commitment outputs' scriptpubkeys witness version or pushbytes32 is wrong");

    // 3. SWAP_LBTC_FOR_TOKEN
    if (callDataBase.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
      // 3.1. check second commitment output asset id is LBTC
      if (tx.vout[2].asset !== pool.quote.asset) return; // throw new Error("second commitment output asset is not LBTC");
      // 3.2. check second commitment output value is equal to service commission (650)
      if (tx.vout[2].value !== Number(config.serviceFee.number)) return; // throw new Error("second commitment output value is not equal to " + Number(config.serviceFee.number));
      // 3.2. check first commitment output value - base_fee - ordering_fee is gte remaining_supply
      result.quote = (tx.vout[1].value || 0) - Number(config.baseFee.number) - callDataBase.orderingFee;
      if (result.quote < Number(config.minRemainingSupply)) return; // throw new Error("first commitment output value is not enough");
    }

    // 4. SWAP_TOKEN_FOR_LBTC
    else if (callDataBase.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
      // 4.1. check second commitment output’s asset is token asset
      if (tx.vout[2].asset !== pool.token.asset) return; // throw new Error("second commitment output's asset is not token asset");
      // 4.2. check second commitment output’s value is gte token min value (50000000)
      result.token = tx.vout[2].value || 0;
      if (result.token < Number(config.minTokenValue)) return; // throw new Error("second commitment output’s value is not gte " + TOKEN_MIN_VALUE);
      // 4.3. check first commitment output value is equal to base_fee + service_commission + ordering_fee
      if (tx.vout[1].value !== Number(config.baseFee.number) + Number(config.serviceFee.number) + callDataBase.orderingFee) return; // throw new Error("first commitment output value is not equal to token value");
    }
    // 5. ADD_LIQUIDITY
    else if (callDataBase.method === CALL_METHOD.ADD_LIQUIDITY) {
      // 5.1. check second commitment output’s asset is token asset
      if (tx.vout[2].asset !== pool.token.asset) return; //throw new Error("second commitment output's asset is not token asset");
      // 5.2. check second commitment output’s value is gte token min value (50000000)
      result.token = tx.vout[2].value || 0;
      if (result.token < Number(config.minTokenValue)) return; // throw new Error("second commitment output’s value is not gte " + TOKEN_MIN_VALUE);
      // 5.3. check first commitment output value - base_fee - service_commission - ordering_fee is gte min_remaining_supply
      result.quote = (tx.vout[1].value || 0) - Number(config.baseFee.number) - Number(config.serviceFee.number) - callDataBase.orderingFee;
      if (result.quote < Number(config.minRemainingSupply)) return; //throw new Error("first commitment output value is not enough");
    }
    // 6. REMOVE_LIQUIDITY
    else if (callDataBase.method === CALL_METHOD.REMOVE_LIQUIDITY) {
      // 6.1. check second commitment output’s asset is LP asset
      if (tx.vout[2].asset !== pool.lp.asset) return; //throw new Error("second commitment output's asset is not LP asset");
      // 6.2. check second commitment output’s value is gte
      result.lp = tx.vout[2].value || 0;
      if (result.lp < 10) return; // throw new Error("second commitment output's value is not gte 1");
      // 6.3. check first commitment output value is equal to base_fee + service_commission + ordering_fee
      if (tx.vout[1].value !== Number(config.baseFee.number) + Number(config.serviceFee.number) + callDataBase.orderingFee) return; // throw new Error("first commitment output value is not equal to base_fee + service_commission + ordering_fee");
    }

    return result;
  } catch (err) {
    throw err;
  }
};
