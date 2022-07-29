import { TxDetail } from "@bitmatrix/esplora-api-client";
import { Pool, PTXFinderResult } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { BitmatrixStoreData } from "../../models/BitmatrixStoreData";
import { broadcastPoolTx } from "./broadcastPoolTx";
import { validatePoolTx } from "./validatePoolTx";

export const poolTxWorker = async (pools: Pool[], txDetails: TxDetail[]) => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  //Pool validasyonlarından geçirme
  if (waitingTxs.length > 0) {
    const waitingCommitmentList: BitmatrixStoreData[] = waitingTxs.filter(
      (value: BitmatrixStoreData) => value.poolTxId === "" || value.poolTxId === null || value.poolTxId === undefined
    );

    if (waitingCommitmentList.length > 0) {
      if (pools.length > 0) {
        for (let i = 0; i < waitingCommitmentList.length; i++) {
          const commitmentData = waitingCommitmentList[i].commitmentData;

          const poolValidationData: PTXFinderResult = await validatePoolTx(commitmentData);

          // const poolTxId: string = await broadcastPoolTx(commitmentData, poolValidationData);

          //telegram ms => tx id ile trans takip et
          // await sendTelegramMessage(
          //   "Tx Id: " +
          //     poolTxId +
          //     "\n" +
          //     "Commitment Data: <b>Method</b>: <code>" +
          //     commitmentData.methodCall +
          //     "</code>, <b>Value</b>: <code>" +
          //     commitmentData.cmtOutput2Value +
          //     "</code>"
          // );

          // await redisClient.updateField(commitmentData.transaction.txid, poolTxId);
        }
      }
    }
  }
};
