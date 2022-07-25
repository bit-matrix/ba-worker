import { CTXFinderResult } from "@bitmatrix/models";
import { redisClient } from "../../../redisClient/redisInit";

export const isCtxSpentWorker = async () => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");
  const waitingTxs = await redisClient.getAllValues<CTXFinderResult>();
};
