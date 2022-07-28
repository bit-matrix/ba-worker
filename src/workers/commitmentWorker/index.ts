import { TxDetail } from "@bitmatrix/esplora-api-client";
import { CTXFinderResult, Pool } from "@bitmatrix/models";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { redisClient } from "@bitmatrix/redis-client";
import { commitmentFinder } from "./commitmentFinder";
import { BitmatrixStoreData } from "../../models/BitmatrixStoreData";

export const commitmentWorker = async (pools: Pool[], newTxDetails: TxDetail[]) => {
  console.log("-------------------COMMINTMENT WORKER-------------------------");
  let promiseArray = [];

  for (let i = 0; i < newTxDetails.length; i++) {
    const newTxDetail = newTxDetails[i];
    promiseArray.push(commitmentFinder(newTxDetail, pools));
  }

  return Promise.all(promiseArray)
    .then(async (values: (CTXFinderResult | undefined)[]) => {
      values.forEach(async (value: CTXFinderResult | undefined) => {
        if (value) {
          const newStoreData: BitmatrixStoreData = { commitmentData: value };

          await redisClient.addKey(value.transaction.txid, 60000, newStoreData);

          await sendTelegramMessage(
            "Pool: " +
              value.poolId +
              "\n" +
              "New Commitment Tx V2: <code>" +
              value.transaction.txid +
              "</code>\n" +
              "Commitment Data: <b>Method</b>: <code>" +
              value.methodCall +
              "</code>, <b>Value</b>: <code>" +
              value.cmtOutput2.value +
              "</code>"
          );
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};