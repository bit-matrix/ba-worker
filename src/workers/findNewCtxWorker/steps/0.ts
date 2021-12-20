import { TxDetail } from "@bitmatrix/esplora-api-client";
import { hexLE } from "@script-wiz/wiz-data";
import { CALL_METHOD } from "@bitmatrix/models";
import { CALL_DATA_BYTE_LENGTH, TX_INPUT_LENGTH, TX_OUTPUT_LENGTH } from "../../../const";
import { positiveNumber32, positiveNumber64 } from "../../../helper/valid64Number";
import { CALL_METHODS } from "../models/callData";
import { STEP_0_DATA } from "../models/STEP_0_DATA";

/**
 *
 * https://docs.google.com/document/d/1ysGu-IXJbACz3-EdxynIlQwQxTvdx4tSvXcok9N1Jc8/edit?usp=sharing
 *
 */
export const step0 = async (assetId: string, tx: TxDetail): Promise<STEP_0_DATA> => {
  try {
    // 1. check tx inputs length
    if (tx.vin.length !== TX_INPUT_LENGTH) throw new Error("tx inputs length is not equal to " + TX_INPUT_LENGTH);

    // 2. check tx outputs length
    if (tx.vout.length !== TX_OUTPUT_LENGTH) throw new Error("tx outputs length is not equal to " + TX_OUTPUT_LENGTH);

    // 3. combined rule
    // 3.1. check first output's scriptpubkey first byte is OP_RETURN (0x6a)
    // 3.2. check first output's scriptpubkey second-thirth byte is OP_PUSHDATA1 (0x4c4e)
    // 3.3. check first output's scriptpubkey's pushed data (call data) length is 78 (80 + 78 bytes)
    // 3.3. check first output's scriptpubkey byte length is 81
    if (!tx.vout[0].scriptpubkey.startsWith("6a4c4e")) throw new Error("first tx output's scriptpubkey's prefix is wrong");
    if (tx.vout[0].scriptpubkey.length !== 2 * (CALL_DATA_BYTE_LENGTH + 3))
      throw new Error("first output's scriptpubkey length is not equal to " + 2 * (CALL_DATA_BYTE_LENGTH + 3));

    // create step_data_0 object for return
    const result: STEP_0_DATA = { CALL_METHOD: CALL_METHOD.SWAP_QUOTE_FOR_TOKEN, RECIPIENT_PUBLIC_KEY: "", SLIPPAGE_TOLERANCE: "", ORDERING_FEE: 0 };

    // 4. get call data
    const CALL_DATA: string = tx.vout[0].scriptpubkey_asm.split(" ")[2];

    // 5.1. check TARGET_FLAG_ASSET_ID (32 byte le)
    if (CALL_DATA.substring(0, 64) !== hexLE(assetId)) throw new Error("wrong target_flag_asset_id");

    // 5.2. check METHOD_CALL (1 byte)
    const result_METHOD_CALL: string = CALL_DATA.substring(64, 66);
    if (!CALL_METHODS.includes(result_METHOD_CALL)) throw new Error("wrong call_method");
    result.CALL_METHOD = <CALL_METHOD>result_METHOD_CALL;

    // 5.3. check RECIPIENT_PUBLIC_KEY starts with '02' or '03' (33 byte)
    const result_RECIPIENT_PUBLIC_KEY: string = CALL_DATA.substring(66, 132);
    if (!result_RECIPIENT_PUBLIC_KEY.startsWith("02") && !result_RECIPIENT_PUBLIC_KEY.startsWith("03")) throw new Error("wrong recipient_public_key");
    result.RECIPIENT_PUBLIC_KEY = result_RECIPIENT_PUBLIC_KEY;

    // 5.4. check SLIPPAGE_TOLERANCE (64 bit LE number)
    const result_SLIPPAGE_TOLERANCE = CALL_DATA.substring(132, 148);
    if (result.CALL_METHOD === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN || result.CALL_METHOD === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
      const result_SLIPPAGE_TOLERANCE_NUMBER = positiveNumber64(result_SLIPPAGE_TOLERANCE, "slippage_tolerange is out of range");
      result.SLIPPAGE_TOLERANCE = result_SLIPPAGE_TOLERANCE_NUMBER;
    } else {
      result.SLIPPAGE_TOLERANCE = "0";
    }

    // 5.5. check ORDERING_FEE (32 bit LE number)
    const result_ORDERING_FEE = CALL_DATA.substring(148);
    const result_ORDERING_FEE_NUMBER: number = positiveNumber32(result_ORDERING_FEE, "ordering_fee is out of range");
    result.ORDERING_FEE = result_ORDERING_FEE_NUMBER;

    // 6.1. check tx is a segwit tx
    // const hex = await txidToRaw(tx.txid);
    // if (!isSegwitTx(hex)) throw new Error("tx is not a segwit tx");

    // 6.2. check tx id is true (2x sha256 of base tx hex)
    // const baseHex = segwitToBaseTx(hex);
    // if (!isValidTxId(tx.txid, baseHex)) throw new Error("tx id is invalid");

    return result;
  } catch (err) {
    throw err;
  }
};
