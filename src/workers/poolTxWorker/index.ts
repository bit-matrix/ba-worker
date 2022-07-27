import { TxDetail } from "@bitmatrix/esplora-api-client";
import { Pool } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { BitmatrixStoreData } from "../../models/BitmatrixStoreData";
import { validatePoolTx } from "./validatePoolTx";

export const poolTxWorker = async (pools: Pool[], txDetails: TxDetail[]) => {
  console.log("-------------------POOL TX WORKER-------------------------");

  const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

  //Pool validasyonlarından geçirme
  if (waitingTxs.length > 0) {
    const waitingCommitmentList: BitmatrixStoreData[] = waitingTxs.filter((value: BitmatrixStoreData) => value.poolTxId === undefined);

    const waitingPoolTxList: BitmatrixStoreData[] = waitingTxs.filter((value: BitmatrixStoreData) => value.poolTxId);

    if (waitingCommitmentList.length > 0) {
      if (pools.length > 0) {
        for (let i = 0; i < waitingCommitmentList.length; i++) {
          const commitmentData = waitingCommitmentList[i].commitmentData;
          const poolTxId = await validatePoolTx(commitmentData);

          await redisClient.updateField(commitmentData.transaction.txid, poolTxId.txId);
        }
      }
    }

    if (waitingPoolTxList.length > 0) {
      for (let i = 0; i < waitingPoolTxList.length; i++) {
        const waitingPoolTx = waitingPoolTxList[i];
        //const poolTxId = await findNewPtxWorker(txDetails);
      }
    }
  }
};
