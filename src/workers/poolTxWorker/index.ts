import { BitmatrixStoreData, Pool, PTXFinderResult } from "@bitmatrix/models";
import { poolTxInfo } from "@bitmatrix/models/PoolTxInfo";
import { redisClient } from "@bitmatrix/redis-client";
import { pools } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { broadcastPoolTx } from "./broadcastPoolTx";
import { validatePoolTx } from "./validatePoolTx";
import { convertion } from "@script-wiz/lib-core";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { hexToNum, lexicographical } from "../../helper/util";

export const poolTxWorker = async () => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const allWaitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  const waitingCommitmentList: BitmatrixStoreData[] = allWaitingTxs.filter(
    (value: BitmatrixStoreData) => value.poolTxInfo?.txId === "" || value.poolTxInfo?.txId === null || value.poolTxInfo?.txId === undefined
  );

  //Pool validasyonlarından geçirme
  if (waitingCommitmentList.length > 0) {
    const bitmatrixPools = await pools();

    const poolWaitingList = bitmatrixPools.map((pool: Pool) => {
      const currentPoolNextList = waitingCommitmentList.filter((nl) => nl.commitmentData.poolId === pool.id);
      if (currentPoolNextList.length === 0) return;

      const todoList = currentPoolNextList
        .sort(
          (a, b) =>
            hexToNum(b.commitmentData.orderingFee) - hexToNum(a.commitmentData.orderingFee) || lexicographical(a.commitmentData.transaction.txid, b.commitmentData.transaction.txid)
        )
        .slice(0, pool.leafCount);

      return { pool, todoList };
    });

    if (poolWaitingList.length > 0) {
      poolWaitingList.forEach(async (pwl) => {
        if (pwl) {
          const poolTxId: string = await broadcastPoolTx(pwl.todoList || [], pwl.pool);
          console.log(poolTxId);
        }
      });
    }
    //   for (let i = 0; i < waitingCommitmentList.length; i++) {
    //     const commitmentData = waitingCommitmentList[i].commitmentData;

    //     if (poolTxId && poolTxId !== "") {
    //       const poolTxInfo: poolTxInfo = {
    //         txId: poolTxId,
    //         isSuccess: poolValidationData.errorMessages.length === 0,
    //         failReason: poolValidationData.errorMessages.join(", "),
    //       };

    //       if (poolTxInfo.isSuccess) {
    //         await sendTelegramMessage(
    //           "Pool Tx Id: " +
    //             poolTxId +
    //             "\n" +
    //             "Method Call: <b>Method</b>: <code>" +
    //             commitmentData.methodCall +
    //             "</code>, <b>Value</b>: <code>" +
    //             commitmentData.cmtOutput2.value +
    //             "</code>"
    //         );
    //       } else {
    //         await sendTelegramMessage(
    //           "Pool Tx Id: " +
    //             poolTxId +
    //             "\n" +
    //             "Method Call: <b>Method</b>: <code>" +
    //             commitmentData.methodCall +
    //             "</code>, <b>Fail swap result : </b>: <code>" +
    //             poolValidationData.errorMessages.join(", ") +
    //             "</code>"
    //         );
    //       }

    //       await redisClient.updateField(commitmentData.transaction.txid, poolTxInfo);
    //     }
    //   }
  }
};
