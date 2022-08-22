import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, Pool, PTXFinderResult } from "@bitmatrix/models";
import { poolTxInfo } from "@bitmatrix/models/PoolTxInfo";
import { redisClient } from "@bitmatrix/redis-client";
import { pools } from "../../business/db-client";
import { sendSlackMessage } from "../../helper/sendSlackMessage";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { broadcastPoolTx } from "./broadcastPoolTx";
import { validatePoolTx } from "./validatePoolTx";

export const poolTxWorker = async () => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  //Pool validasyonlarından geçirme
  if (waitingTxs.length > 0) {
    const bitmatrixPools = await pools();

    const waitingCommitmentList: any[] = waitingTxs.filter(
      (value: BitmatrixStoreData) => value.poolTxInfo?.txId === "" || value.poolTxInfo?.txId === null || value.poolTxInfo?.txId === undefined
    );

    if (waitingCommitmentList.length > 0) {
      for (let i = 0; i < waitingCommitmentList.length; i++) {
        const commitmentData = waitingCommitmentList[i].commitmentData;

        const poolValidationData: PTXFinderResult = await validatePoolTx(commitmentData, bitmatrixPools);
        const poolTxId: string = await broadcastPoolTx(commitmentData, poolValidationData);

        if (poolTxId && poolTxId !== "") {
          const poolTxInfo: poolTxInfo = {
            txId: poolTxId,
            isSuccess: poolValidationData.errorMessages.length === 0,
            failReason: poolValidationData.errorMessages.join(", "),
          };

          let telegramMessageText = "";

          if (poolTxInfo.isSuccess) {
            console.log("if- poolTxWorker - poolTxId", poolTxId);
            console.log("if- poolTxWorker - commitmentData", commitmentData);
            if (commitmentData.methodCall === "03") {
              telegramMessageText =
                "Pool Transaction Completed successfully.\nPool Tx Id: " +
                poolTxId +
                "\nCommitment Data: <b>Method</b>: <code>" +
                commitmentData.methodCall +
                "</code>, <b>Pair 1 Value</b>: <code>" +
                commitmentData.cmtOutput1.value +
                "" +
                commitmentData.pair1Ticker +
                "</code> + <b>Pair 2 Value</b>: <code>" +
                commitmentData.cmtOutput2.value +
                "" +
                commitmentData.pair2Ticker +
                "</code> ---> <b>LP Value</b>: <code>" +
                commitmentData.cmtOutput3.value +
                "" +
                commitmentData.lpTicker +
                (await sendTelegramMessage(telegramMessageText));
            } else if (commitmentData.methodCall === "04") {
              telegramMessageText =
                "Pool Transaction Completed successfully.\nPool Tx Id: " +
                poolTxId +
                "\nCommitment Data: <b>Method</b>: <code>" +
                commitmentData.methodCall +
                "</code>, <b>LP Value</b>: <code>" +
                commitmentData.cmtOutput3.value +
                "" +
                commitmentData.lpTicker +
                "</code> ---> <b>Pair 1 Value</b>: <code>" +
                commitmentData.cmtOutput1.value +
                "" +
                commitmentData.pair1Ticker +
                "</code> + <b>Pair 2 Value</b>: <code>" +
                commitmentData.cmtOutput2.value +
                "" +
                commitmentData.pair2Ticker +
                (await sendTelegramMessage(telegramMessageText));
            } else {
              telegramMessageText =
                "Pool Transaction Completed successfully.\nPool Tx Id: " +
                poolTxId +
                "\nCommitment Data: <b>Method</b>: <code>" +
                commitmentData.methodCall +
                "</code>" +
                "<b>Pair 1 Value</b>: <code>" +
                commitmentData.cmtOutput1.value +
                "" +
                commitmentData.pair1Ticker +
                "</code> ---> <b>Pair 2 Value</b>: <code>" +
                commitmentData.cmtOutput2.value +
                "" +
                commitmentData.pair2Ticker +
                (await sendTelegramMessage(telegramMessageText));
            }

            // sendSlackMessage(
            //   "*Pool* *Tx* *Id:* " + poolTxId + "\n" + "*Method* *Call:* _Method_ _-_ " + commitmentData.methodCall + ", _Value_ _-_ " + commitmentData.cmtOutput2Value
            // );
          } else {
            console.log("else- poolTxWorker - poolTxId", poolTxId);
            console.log("else- poolTxWorker - commitmentData", commitmentData);
            console.log("else- poolTxWorker - poolValidationData", poolValidationData);

            await sendTelegramMessage(
              "Pool Tx Id: " +
                poolTxId +
                "\n" +
                "Commitment Data: <b>Method</b>: <code>" +
                commitmentData.methodCall +
                "</code>, <b>Fail swap result : </b> <code>" +
                poolValidationData.errorMessages.join(", ") +
                "</code>"
            );

            // sendSlackMessage(
            //   "*Pool* *Tx* *Id:* " +
            //     poolTxId +
            //     "\n" +
            //     "*Method* *Call:* _Method_ _-_ " +
            //     commitmentData.methodCall +
            //     ", _Fail_ _Swap_ _Result_ _-_ " +
            //     poolValidationData.errorMessages.join(", ")
            // );
          }

          await redisClient.updateField(commitmentData.transaction.txid, poolTxInfo);
        }
      }
    }
  }
};
