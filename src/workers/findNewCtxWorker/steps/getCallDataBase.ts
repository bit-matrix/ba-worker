import { TxDetail } from "@bitmatrix/esplora-api-client";
import { hexLE } from "@script-wiz/wiz-data";
import { CallDataBase, CALL_METHOD } from "@bitmatrix/models";

import { positiveNumber32, positiveNumber64 } from "../../../helper/valid64Number";

/**
 *
 * https://docs.google.com/document/d/1ysGu-IXJbACz3-EdxynIlQwQxTvdx4tSvXcok9N1Jc8/edit?usp=sharing
 *
 */
export const CTX_INPUT_LENGTH = 2;
export const CTX_OUTPUT_LENGTH = 4;
export const CALL_DATA_BYTE_LENGTH = 78;

export const getCallDataBase = (assetId: string, tx: TxDetail): CallDataBase | undefined => {
  try {
    // 1. check tx inputs length
    if (tx.vin.length !== CTX_INPUT_LENGTH) return; // throw new Error("tx inputs length is not equal to " + CTX_INPUT_LENGTH);

    // 2. check tx outputs length
    if (tx.vout.length !== CTX_OUTPUT_LENGTH) return; // throw new Error("tx outputs length is not equal to " + TX_OUTPUT_LENGTH);

    // 3. combined rule
    // 3.1. check first output's scriptpubkey first byte is OP_RETURN (0x6a)
    // 3.2. check first output's scriptpubkey second-thirth byte is OP_PUSHDATA1 (0x4c4e)
    // 3.3. check first output's scriptpubkey's pushed data (call data) length is 78 (80 + 78 bytes)
    // 3.3. check first output's scriptpubkey byte length is 81
    if (!tx.vout[0].scriptpubkey.startsWith("6a4c4e")) return; // throw new Error("first tx output's scriptpubkey's prefix is wrong");
    if (tx.vout[0].scriptpubkey.length !== 2 * (CALL_DATA_BYTE_LENGTH + 3)) return; // throw new Error("first output's scriptpubkey length is not equal to " + 2 * (CALL_DATA_BYTE_LENGTH + 3));

    // create CallDataBase object for return
    const result: CallDataBase = { method: CALL_METHOD.SWAP_QUOTE_FOR_TOKEN, recipientPublicKey: "", slippageTolerance: "0", orderingFee: 0 };

    if (tx.vout[0].scriptpubkey_asm.split(" ").length !== 3) return;

    // 4. get call data
    const allCallData: string = tx.vout[0].scriptpubkey_asm.split(" ")[2];

    if (allCallData.length)
      if (allCallData.substring(0, 64) !== hexLE(assetId))
        // 5.1. check TARGET_FLAG_ASSET_ID (32 byte le)
        return; // throw new Error("wrong target_flag_asset_id");

    // 5.2. check method (1 byte)
    const method: string = allCallData.substring(64, 66);
    if (!["01", "02", "03", "04"].includes(method)) return; // throw new Error("wrong call_method");
    result.method = <CALL_METHOD>method;

    // 5.3. check recipientPublicKey starts with '02' or '03' (33 byte)
    const recipientPublicKey: string = allCallData.substring(66, 132);
    if (!recipientPublicKey.startsWith("02") && !recipientPublicKey.startsWith("03")) return; // throw new Error("wrong recipient_public_key");
    result.recipientPublicKey = recipientPublicKey;

    // 5.4. check SLIPPAGE_TOLERANCE (64 bit LE number)
    const slippageToleranceHex = allCallData.substring(132, 148);
    if (result.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN || result.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
      try {
        const slippageTolerance = positiveNumber64(slippageToleranceHex, "slippage_tolerange is out of range");
        result.slippageTolerance = slippageTolerance;
      } catch {
        return;
      }
    }

    // 5.5. check ORDERING_FEE (32 bit LE number)
    const orderingFeeString = allCallData.substring(148);
    try {
      const result_ORDERING_FEE_NUMBER: number = positiveNumber32(orderingFeeString, "ordering_fee is out of range");
      result.orderingFee = result_ORDERING_FEE_NUMBER;
    } catch {
      return;
    }

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
