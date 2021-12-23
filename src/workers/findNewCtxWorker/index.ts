import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CallData, CALL_METHOD, CommitmentOutput, Pool } from "@bitmatrix/models";
import { config, ctxNewSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isCtxWorker } from "./isCtxWorker";

export const findNewCtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  try {
    // console.log("Find new ctx worker started for pool: " + pool.id + ", newBlockheight: " + newBmBlockInfo.block_height);
    // console.log("Find new ctx worker started");
    // console.log("Tx count: " + newTxDetails.length);

    const poolConfig: BmConfig = await config(pool.id);

    for (let i = 0; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
      const callDataOutputs: { callData: CallData; output: CommitmentOutput } | undefined = await isCtxWorker(pool, poolConfig, newTxDetail);
      if (callDataOutputs) {
        // console.log("Found call data!", callDataOutputs);

        const bmCtxNew: BmCtxNew = { ...callDataOutputs, commitmentTx: { txid: newTxDetail.txid, block_height: newBlock.height, block_hash: newBlock.id } };
        await ctxNewSave(pool.id, bmCtxNew);

        const val =
          callDataOutputs.callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN
            ? callDataOutputs.callData.value.quote
            : CALL_METHOD.SWAP_TOKEN_FOR_QUOTE
            ? callDataOutputs.callData.value.token
            : callDataOutputs.callData.value.lp;
        sendTelegramMessage(
          "Commmitment Tx: <code>" +
            bmCtxNew.commitmentTx.txid +
            "</code>\n" +
            "Commmitment Data: <b>Method</b>: <code>" +
            callDataOutputs.callData.method +
            "</code>, <b>Value</b>: <code>" +
            val +
            "</code>"
        );
      }
    }
  } catch (error) {
    console.error("findNewCtxWorker.error", error);
  }
};
