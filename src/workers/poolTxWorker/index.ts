import { TxDetail } from "@bitmatrix/esplora-api-client";
import { CTXFinderResult, Pool } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { validateAndBroadcastPoolTx } from "./validateAndBroadcastPoolTx";

export const poolTxWorker = async (pools: Pool[], txDetails: TxDetail[]) => {
  console.log("-------------------POOL TX WORKER-------------------------");
  //redisten ctx'leri cekme.

  //TODO:Pool transaction Id'leri update etme

  const waitingTxs = await redisClient.getAllValues<CTXFinderResult>();

  //Pool validasyonlarından geçirme
  if (waitingTxs.length > 0) {
    const waitingCommitmentList: CTXFinderResult[] = waitingTxs.filter((value: CTXFinderResult) => !value.transaction.txid);
    const waitingPoolTxList: CTXFinderResult[] = waitingTxs.filter((value: CTXFinderResult) => value.transaction.txid);

    if (waitingCommitmentList.length > 0) {
      if (pools.length > 0) {
        for (let i = 0; i < waitingCommitmentList.length; i++) {
          const commitmentTx = waitingCommitmentList[i];
          const poolTxId = await validateAndBroadcastPoolTx(commitmentTx);

          await redisClient.updateField(commitmentTx.transaction.txid, poolTxId.txId);
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
