import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, Pool, PTXFinderResult } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { broadcastPoolTx } from "./broadcastPoolTx";
import { validatePoolTx } from "./validatePoolTx";

export const poolTxWorker = async () => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  //Pool validasyonlarından geçirme
  if (waitingTxs.length > 0) {
    const waitingCommitmentList: BitmatrixStoreData[] = waitingTxs.filter(
      (value: BitmatrixStoreData) => value.poolTxInfo?.txId === "" || value.poolTxInfo?.txId === null || value.poolTxInfo?.txId === undefined
    );

    if (waitingCommitmentList.length > 0) {
      for (let i = 0; i < waitingCommitmentList.length; i++) {
        const commitmentData = waitingCommitmentList[i].commitmentData;

        const poolValidationData: PTXFinderResult = await validatePoolTx(commitmentData);

        const poolTxId: string = await broadcastPoolTx(commitmentData, poolValidationData);

        await sendTelegramMessage(
          "Pool Tx Id: " +
            poolTxId +
            "\n" +
            "Method Call: <b>Method</b>: <code>" +
            commitmentData.methodCall +
            "</code>, <b>Value</b>: <code>" +
            commitmentData.cmtOutput2Value +
            "</code>"
        );

        await redisClient.updateField(commitmentData.transaction.txid, poolTxId);
      }
    }
  }
};
