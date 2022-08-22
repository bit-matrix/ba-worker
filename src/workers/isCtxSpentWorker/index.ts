import { esploraClient } from "@bitmatrix/esplora-api-client";
import { CALL_METHOD, CommitmentTxHistory } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { ctxHistorySave } from "../../business/db-client";
import { sendSlackMessage } from "../../helper/sendSlackMessage";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { BitmatrixStoreData } from "../../models/BitmatrixStoreData";

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
          let telegramMessageText = "";
          if (tx.commitmentData.methodCall === "03") {
            telegramMessageText =
              "Pool Id: " +
              tx.commitmentData.poolId +
              "\nSwap Completed for : <code>" +
              txId +
              "\nPool Tx Id:" +
              (tx.poolTxInfo?.txId || "unknown pool tx id") +
              "</code>\nCommitment Data: <b>CASE: </b>: <code>" +
              tx.commitmentData.methodCall +
              "</code>\n<b>Pair 1 Value</b>: <code>" +
              tx.commitmentData.cmtOutput1.value +
              " " +
              tx.commitmentData.pair1Ticker +
              "</code> + <b>Pair 2 Value</b>: <code>" +
              tx.commitmentData.cmtOutput2.value +
              " " +
              tx.commitmentData.pair2Ticker +
              "</code>" +
              "<code> \n <b>LP Value</b>:" +
              tx.commitmentData.cmtOutput3?.value +
              " " +
              tx.commitmentData.lpTicker +
              "</code>";
          } else if (tx.commitmentData.methodCall === "04") {
            telegramMessageText =
              "Pool Id: " +
              tx.commitmentData.poolId +
              "\nSwap Completed for : <code>" +
              txId +
              "\nPool Tx Id:" +
              (tx.poolTxInfo?.txId || "unknown pool tx id") +
              "</code>\nCommitment Data: <b>CASE: </b>: <code>" +
              tx.commitmentData.methodCall +
              "</code>\n<b>LP Value</b>:" +
              tx.commitmentData.cmtOutput3?.value +
              " " +
              tx.commitmentData.lpTicker +
              "</code> ---> <b>Pair 1 Value</b>: <code>" +
              tx.commitmentData.cmtOutput1.value +
              " " +
              tx.commitmentData.pair1Ticker +
              "</code> + <b>Pair 2 Value</b>: <code>" +
              tx.commitmentData.cmtOutput2.value +
              " " +
              tx.commitmentData.pair2Ticker +
              "</code>";
          } else {
            telegramMessageText =
              "Pool Id: " +
              tx.commitmentData.poolId +
              "\nSwap Completed for : <code>" +
              txId +
              "\nPool Tx Id:" +
              (tx.poolTxInfo?.txId || "unknown pool tx id") +
              "</code>\nCommitment Data: <b>CASE: </b>: <code>" +
              tx.commitmentData.methodCall +
              "</code>\n<b>Pair 1 Value</b>: <code>" +
              tx.commitmentData.cmtOutput1.value +
              " " +
              tx.commitmentData.pair1Ticker +
              "</code> ---> <b>Pair 2 Value</b>: <code>" +
              tx.commitmentData.cmtOutput2.value +
              " " +
              tx.commitmentData.pair2Ticker +
              "</code>";
          }

          await sendTelegramMessage(telegramMessageText);

          // sendSlackMessage(
          //   "*Pool* *Id:* " +
          //     tx.commitmentData.poolId +
          //     "\n" +
          //     "*Pool* *Tx* *Id:* " +
          //     (tx.poolTxInfo?.txId || "unknown pool id") +
          //     "\n" +
          //     "*Swap* *Completed* *for:* " +
          //     txId +
          //     "\n" +
          //     "*Commitment* *Data:* _Method_ _-_ " +
          //     tx.commitmentData.methodCall +
          //     ", _Value_ _-_ " +
          //     tx.commitmentData.cmtOutput2.value
          // );
        }
      }
    }
  }
};
