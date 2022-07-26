import { esploraClient } from "@bitmatrix/esplora-api-client";
import { CTXFinderResult } from "@bitmatrix/models";
import { redisClient } from "../../redisClient/redisInit";

export const isCtxSpentWorker = async () => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");
  const waitingTxs = await redisClient.getAllValues<CTXFinderResult>();

  if (waitingTxs.length > 0) {
    for (const tx of waitingTxs) {
      const outspends = await esploraClient.txOutspends(tx.transaction.txid);

      if (outspends[1].spent || outspends[2].spent) {
        await redisClient.removeKey(tx.transaction.txid);

        // add tx history
      }
    }
  }
};
