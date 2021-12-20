import { CALL_METHOD } from "../../../business/data/models/BmTx";
import {
  BASE_FEE,
  COMMITMENT_SCRIPTPUBKEY_BYTE_LENGTH,
  LBTC_ASSET_ID,
  LP_ASSET_ID,
  MIN_REMAINING_SUPPLY,
  SERVICE_COMMISSION,
  TOKEN_ASSET_ID,
  TOKEN_MIN_VALUE,
} from "../../../const";
import { BitmatrixTxCommitment } from "../models/BitmatrixTxCommitment";
import { STEP_1_DATA } from "../models/STEP_1_DATA";

/**
 *
 * https://docs.google.com/document/d/1jz5Reg-0YSME4DjYo6cm9tb_gGSLJsinBL7YI5pRR18/edit?usp=sharing
 *
 */
export const step1 = (btxc: BitmatrixTxCommitment): STEP_1_DATA => {
  const result: STEP_1_DATA = { satoshiValue: 0, tokenValue: 0, lpValue: 0 };
  try {
    // 1. check first commitment output’s asset is LBTC
    if (btxc.tx.vout[1].asset !== LBTC_ASSET_ID) throw new Error("first commitment output's asset is not lbtc");

    // 2.1. check commitment outputs’ scriptpubkeys are equal
    if (btxc.tx.vout[1].scriptpubkey !== btxc.tx.vout[2].scriptpubkey) throw new Error("commitment outputs' scriptpubkeys are not equal");
    // 2.2. check commitment outputs’ scriptpubkeys byte length is 34
    if (btxc.tx.vout[1].scriptpubkey.length !== COMMITMENT_SCRIPTPUBKEY_BYTE_LENGTH * 2)
      throw new Error("commitment outputs' scriptpubkey byte length is not " + COMMITMENT_SCRIPTPUBKEY_BYTE_LENGTH * 2);
    // 2.3. check commitment outputs’ scriptpubkeys witness version is 1 (0x51) and pushbytes32 (0x20)
    if (!btxc.tx.vout[1].scriptpubkey.startsWith("5120")) throw new Error("commitment outputs' scriptpubkeys witness version or pushbytes32 is wrong");

    // 3. SWAP_LBTC_FOR_TOKEN
    if (btxc.stepData0.CALL_METHOD === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
      // 3.1. check second commitment output asset id is LBTC
      if (btxc.tx.vout[2].asset !== LBTC_ASSET_ID) throw new Error("second commitment output asset is not LBTC");
      // 3.2. check second commitment output value is equal to service commission (650)
      if (btxc.tx.vout[2].value !== SERVICE_COMMISSION) throw new Error("second commitment output value is not equal to " + SERVICE_COMMISSION);
      // 3.2. check first commitment output value - base_fee - ordering_fee is gte remaining_supply
      result.satoshiValue = (btxc.tx.vout[1].value || 0) - BASE_FEE - btxc.stepData0.ORDERING_FEE;
      if (result.satoshiValue < MIN_REMAINING_SUPPLY) throw new Error("first commitment output value is not enough");
    }
    // 4. SWAP_TOKEN_FOR_LBTC
    else if (btxc.stepData0.CALL_METHOD === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
      // 4.1. check second commitment output’s asset is token asset
      if (btxc.tx.vout[2].asset !== TOKEN_ASSET_ID) throw new Error("second commitment output's asset is not token asset");
      // 4.2. check second commitment output’s value is gte token min value (50000000)
      result.tokenValue = btxc.tx.vout[2].value || 0;
      if (result.tokenValue < TOKEN_MIN_VALUE) throw new Error("second commitment output’s value is not gte " + TOKEN_MIN_VALUE);
      // 4.3. check first commitment output value is equal to base_fee + service_commission + ordering_fee
      if (btxc.tx.vout[1].value !== BASE_FEE + SERVICE_COMMISSION + btxc.stepData0.ORDERING_FEE) throw new Error("first commitment output value is not equal to token value");
    }
    // 5. ADD_LIQUIDITY
    else if (btxc.stepData0.CALL_METHOD === CALL_METHOD.ADD_LIQUIDITY) {
      // 5.1. check second commitment output’s asset is token asset
      if (btxc.tx.vout[2].asset !== TOKEN_ASSET_ID) throw new Error("second commitment output's asset is not token asset");
      // 5.2. check second commitment output’s value is gte token min value (50000000)
      result.tokenValue = btxc.tx.vout[2].value || 0;
      if (result.tokenValue < TOKEN_MIN_VALUE) throw new Error("second commitment output’s value is not gte " + TOKEN_MIN_VALUE);
      // 5.3. check first commitment output value - base_fee - service_commission - ordering_fee is gte min_remaining_supply
      result.satoshiValue = (btxc.tx.vout[1].value || 0) - BASE_FEE - SERVICE_COMMISSION - btxc.stepData0.ORDERING_FEE;
      if (result.satoshiValue < MIN_REMAINING_SUPPLY) throw new Error("first commitment output value is not enough");
    }
    // 6. REMOVE_LIQUIDITY
    else if (btxc.stepData0.CALL_METHOD === CALL_METHOD.REMOVE_LIQUIDITY) {
      // 6.1. check second commitment output’s asset is LP asset
      if (btxc.tx.vout[2].asset !== LP_ASSET_ID) throw new Error("second commitment output's asset is not LP asset");
      // 6.2. check second commitment output’s value is gte
      result.lpValue = btxc.tx.vout[2].value || 0;
      if (result.lpValue < 10) throw new Error("second commitment output's value is not gte 1");
      // 6.3. check first commitment output value is equal to base_fee + service_commission + ordering_fee
      if (btxc.tx.vout[1].value !== BASE_FEE + SERVICE_COMMISSION + btxc.stepData0.ORDERING_FEE)
        throw new Error("first commitment output value is not equal to base_fee + service_commission + ordering_fee");
    }

    return result;
  } catch (err) {
    throw err;
  }
};
