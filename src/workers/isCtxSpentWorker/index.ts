import { esploraClient } from "@bitmatrix/esplora-api-client";
import { CTXFinderResult } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { BitmatrixStoreData } from "../../models/BitmatrixStoreData";

export const isCtxSpentWorker = async () => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");
  const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  if (waitingTxs.length > 0) {
    for (const tx of waitingTxs) {
      const txId = tx.commitmentData.transaction.txid;

      const outspends = await esploraClient.txOutspends(txId);

      if (outspends[1].spent || outspends[2].spent) {
        await redisClient.removeKey(txId);

        // @to-do add tx history

        // @to-do telegram message swap completed for ctx = ""
        await sendTelegramMessage(
          "Pool Tx Id: " +
            (tx.poolTxId || "unknown pool id") +
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
};
