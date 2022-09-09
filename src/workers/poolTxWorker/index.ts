import { BitmatrixStoreData, Pool } from "@bitmatrix/models";
import { poolTxInfo } from "@bitmatrix/models/PoolTxInfo";
import { redisClient } from "@bitmatrix/redis-client";
import { pools } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { broadcastPoolTx } from "./broadcastPoolTx";
import { hexToNum, lexicographical } from "../../helper/util";

export const poolTxWorker = async () => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const allWaitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  // const waitingCommitmentList: BitmatrixStoreData[] = allWaitingTxs.filter(
  //   (value: BitmatrixStoreData) => value.poolTxInfo?.txId === "" || value.poolTxInfo?.txId === null || value.poolTxInfo?.txId === undefined
  // );

  //Pool validasyonlarından geçirme
  if (allWaitingTxs.length > 0) {
    const bitmatrixPools = await pools();

    const poolWaitingList = bitmatrixPools.map((pool: Pool) => {
      const currentPoolNextList = allWaitingTxs.filter((nl) => nl.commitmentData.poolId === pool.id);
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
          if (pwl.todoList.length > 0) {
            const { poolTxId, commitmentDataState } = await broadcastPoolTx(pwl.todoList || [], pwl.pool);
            let successTxIds = [];
            let failTxIds = [];

            for (let i = 0; i < commitmentDataState.length; i++) {
              const resultData = commitmentDataState[i];

              if (poolTxId && poolTxId !== "") {
                const poolTxInfo: poolTxInfo = {
                  txId: poolTxId,
                  isSuccess: resultData.poolValidationData.errorMessages.length === 0,
                  failReason: resultData.poolValidationData.errorMessages.join(", "),
                };

                if (poolTxInfo.isSuccess) {
                  successTxIds.push(resultData.commitmentData.transaction.txid);
                } else {
                  failTxIds.push(resultData.commitmentData.transaction.txid);
                }

                try {
                  await redisClient.updateField(resultData.commitmentData.transaction.txid, poolTxInfo);
                } catch (error) {
                  console.log("broadcast error", error);
                }
              }
            }

            if (successTxIds.length > 0) {
              await sendTelegramMessage("Pool Tx Id: " + poolTxId + "\n" + "Succesfully Commitment Tx Ids: <b>Method</b>: <code>" + successTxIds.join(",") + "</code>");
            } else if (failTxIds.length > 0) {
              await sendTelegramMessage("Pool Tx Id: " + poolTxId + "\n" + "Failure Commitment Tx Ids: <b>Method</b>: <code>" + failTxIds.join(",") + "</code>");
            }
          }
        }
      });
    }
  }
};
