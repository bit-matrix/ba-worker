import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { sendSlackMessage } from "../../helper/sendSlackMessage";
import { commitmentFinder, CTXFinderResult } from "./commitmentFinder";
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
      values.forEach(async (value: CTXFinderResult | undefined) => {
        if (value) {
          const newStoreData: BitmatrixStoreData = { commitmentData: value };

          await redisClient.addKey(value.transaction.txid, 60000, newStoreData);

          let telegramMessageText = "";

          if (synced) {
            if (value.methodCall === "03") {
              telegramMessageText =
                "Pool Id: " +
                value.poolId +
                "\nNew Commitment Tx V2: <code>" +
                value.transaction.txid +
                "</code> \nCommitment Data\n<b>CASE</b>: <code>" +
                value.methodCall +
                "\n<b>Pair 1 Value</b>: <code>" +
                value.cmtOutput1.value +
                " " +
                value.pair1Ticker +
                "</code> + <b>Pair 2 Value</b>: <code> " +
                value.cmtOutput2.value +
                " " +
                value.pair2Ticker +
                "</code> ---> <b>LP Value</b>: <code>" +
                value.cmtOutput3?.value +
                " " +
                value.lpTicker +
                "</code>";
            } else if (value.methodCall === "04") {
              telegramMessageText =
                "Pool: " +
                value.poolId +
                "\nNew Commitment Tx V2: <code>" +
                value.transaction.txid +
                "</code> \nCommitment Data \n <b>CASE</b>: <code>" +
                value.methodCall +
                "\n<b>LP Value</b>: <code>" +
                value.cmtOutput3?.value +
                " " +
                value.lpTicker +
                "</code>  ---> <b>Pair 1 Value</b>: <code>" +
                value.cmtOutput1.value +
                " " +
                value.pair1Ticker +
                "<b>Pair 2 Value</b>: <code>" +
                value.cmtOutput2.value +
                " " +
                value.pair2Ticker +
                "</code>";
            } else {
              telegramMessageText =
                "Pool: " +
                value.poolId +
                "\nNew Commitment Tx V2: <code>" +
                value.transaction.txid +
                "</code> \nCommitment Data \n<b>Method</b>: <code>" +
                value.methodCall +
                "\n<b>Pair 1 Value</b>: <code>" +
                value.cmtOutput1.value +
                " " +
                value.pair1Ticker +
                "</code> ---> <b> Pair 2 Value</b>: <code>" +
                value.cmtOutput2.value +
                " " +
                value.pair2Ticker +
                "</code>" +
                "ℹ️ User gave <code/>" +
                value.cmtOutput1.value +
                " " +
                value.pair1Ticker +
                "</code>, wanted to get <code>" +
                value.cmtOutput2.value +
                " " +
                value.pair2Ticker +
                "</code>";
            }
            await sendTelegramMessage(telegramMessageText);

            // sendSlackMessage(
            //   "*Pool:* " +
            //     value.poolId +
            //     "\n" +
            //     "*New* *Commitment* *Tx* *V2:* " +
            //     value.transaction.txid +
            //     "\n" +
            //     "*Commitment* *Data:* _Method_ _-_ " +
            //     value.methodCall +
            //     ", _Value_ _-_ " +
            //     value.cmtOutput2.value
            // );
          }
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
