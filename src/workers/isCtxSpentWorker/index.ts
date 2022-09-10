import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, CALL_METHOD, CommitmentTxHistory } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { ctxHistorySave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

export const isCtxSpentWorker = async (waitingTxs: BitmatrixStoreData[], synced: boolean) => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");

  if (waitingTxs.length > 0) {
    for (const tx of waitingTxs) {
      const txId = tx.commitmentData.transaction.txid;

      const outspends = await esploraClient.txOutspends(txId);

      if (outspends[0].spent) {
        await redisClient.removeKey(txId);

        const commitmentTxHistory: CommitmentTxHistory = {
          poolId: tx.commitmentData.poolId,
          method: tx.commitmentData.methodCall as CALL_METHOD,
          txId,
          isSuccess: tx.poolTxInfo?.isSuccess || false,
          failReasons: tx.poolTxInfo?.failReason || "",
        };

        await ctxHistorySave(txId, commitmentTxHistory);
      }
    }

    if (synced) {
      await sendTelegramMessage("Swap Completed for : <code>" + waitingTxs.map((wt) => wt.commitmentData.transaction.txid).join(",") + "</code>");
    }
  }
};
