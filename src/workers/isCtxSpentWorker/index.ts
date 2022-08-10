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

      if (outspends[1].spent || outspends[2].spent) {
        await redisClient.removeKey(txId);

        const commitmentTxHistory: CommitmentTxHistory = {
          poolId: tx.commitmentData.poolId,
          method: tx.commitmentData.methodCall as CALL_METHOD,
          txId,
          isSuccess: tx.poolTxInfo?.isSuccess || false,
          failReasons: tx.poolTxInfo?.failReason || "",
        };

        await ctxHistorySave(txId, commitmentTxHistory);

        if (synced) {
          await sendTelegramMessage(
            "Pool Id: " +
              tx.commitmentData.poolId +
              "\n" +
              "Pool Tx Id: " +
              (tx.poolTxInfo?.txId || "unknown pool id") +
              "\n" +
              "Swap Completed for : <code>" +
              txId +
              "</code>\n" +
              "Commitment Data: <b>Method</b>: <code>" +
              tx.commitmentData.methodCall +
              "</code>, <b>Value</b>: <code>" +
              tx.commitmentData.cmtOutput2.value +
              "</code>"
          );
        }
      }
    }
  }
};
