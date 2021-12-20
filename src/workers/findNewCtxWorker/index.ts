import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BmBlockInfo, BmCtxNew, CallData, Pool } from "@bitmatrix/models";
import { ctxNewSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isCtxWorker } from "./isCtxWorker";

export const findNewCtxWorker = async (pool: Pool, newBmBlockInfo: BmBlockInfo, newTxDetails: TxDetail[]) => {
  try {
    // console.log("Find new ctx worker started for pool: " + pool.id + ", newBlockheight: " + newBmBlockInfo.block_height);
    console.log("Find new ctx worker started");
    console.log("Tx count: " + newTxDetails.length);

    if (newTxDetails.length === 1) return;

    for (let i = 1; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
      const callData: CallData | undefined = await isCtxWorker(pool, newBmBlockInfo, newTxDetail);
      if (callData) {
        console.log("Found call data!", callData);

        const bmCtxNew: BmCtxNew = { callData, commitmentTx: { txid: newTxDetail.txid, ...newBmBlockInfo } };
        await ctxNewSave(pool.id, bmCtxNew);
        sendTelegramMessage("new ctx: https://db.bitmatrix-aggregate.com/ctx/43a2f4ef8ce286e57ab3e39e6da3741382ba542854a1b28231a7a5b8ba337fcd/" + bmCtxNew.commitmentTx.txid);
      }
    }
  } catch (error) {
    console.error("findNewCtxWorker.error", error);
  }
};
