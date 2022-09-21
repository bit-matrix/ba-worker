import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, CALL_METHOD, CommitmentTxHistory } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { ctxHistorySave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

export const isCtxSpentWorker = async (waitingTxs: BitmatrixStoreData[], synced: boolean) => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");

  if (waitingTxs.length > 0) {
    let completedTxs = [];
    for (const tx of waitingTxs) {
      const txId = tx.commitmentData.transaction.txid;

      const outspends = await esploraClient.txOutspends(txId);
      if (outspends[0].spent) {
        await redisClient.removeKey(txId);
        completedTxs.push(txId);

        const commitmentTxHistory: CommitmentTxHistory = {
          poolId: tx.commitmentData.poolId,
          method: tx.commitmentData.methodCall as CALL_METHOD,
          txId,
          isSuccess: tx.poolTxInfo?.isSuccess || false,
          timestamp: outspends[0].status?.block_time || 0,
          failReasons: tx.poolTxInfo?.failReason || "",
          value: tx.commitmentData.cmtOutput2.value.toString(),
        };

        await ctxHistorySave(txId, commitmentTxHistory);
      }
    }

    if (synced && completedTxs.length > 0) {
      await sendTelegramMessage("Swap Completed for : <code>" + completedTxs.join(",") + "</code>");
    }
  }
};
