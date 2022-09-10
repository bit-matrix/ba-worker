import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, CTXFinderResult, Pool } from "@bitmatrix/models";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { redisClient } from "@bitmatrix/redis-client";
import { commitmentFinder } from "./commitmentFinder";
import { pools } from "../../business/db-client";

export const commitmentWorker = async (newTxDetails: TxDetail[], synced: boolean) => {
  console.log("-------------------COMMINTMENT WORKER-------------------------");
  let promiseArray = [];

  const bitmatrixPools = await pools();

  for (let i = 0; i < newTxDetails.length; i++) {
    const newTxDetail = newTxDetails[i];
    promiseArray.push(commitmentFinder(newTxDetail, bitmatrixPools));
  }

  return Promise.all(promiseArray)
    .then(async (values: (CTXFinderResult | undefined)[]) => {
      let txIds: string[] = [];
      values.forEach(async (value: CTXFinderResult | undefined) => {
        if (value) {
          const newStoreData: BitmatrixStoreData = { commitmentData: value };
          txIds.push(value.transaction.txid);
          await redisClient.addKey(value.transaction.txid, 60000, newStoreData);

          // if (synced) {
          //   await sendTelegramMessage(
          //     "Pool: " +
          //       value.poolId +
          //       "\n" +
          //       "New Commitment Tx V2: <code>" +
          //       value.transaction.txid +
          //       "</code>\n" +
          //       "Commitment Data: <b>Method</b>: <code>" +
          //       value.methodCall +
          //       "</code>, <b>Value</b>: <code>" +
          //       value.cmtOutput2.value +
          //       "</code>"
          //   );
          // }
        }
      });

      if (synced) {
        await sendTelegramMessage("New Commitment Tx Ids: <code>" + txIds.join(",") + "</code>");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
