import { TxDetail } from "@bitmatrix/esplora-api-client";
import { CTXFinderResult } from "@bitmatrix/models";
import { pools } from "../../../business/db-client";
import { RedisClient } from "../../../redisClient/RedisClient";
import { validateAndBroadcastPoolTx } from "./validateAndBroadcastPoolTx";

const redisClient = new RedisClient("redis://localhost:6379");

export const poolTxWorker = async (txDetails: TxDetail[]) => {
  //redisten ctx'leri cekme.
  //todo: valide etme
  const values: CTXFinderResult[] = await redisClient.getAllValues();
  //TODO:Pool transaction Id'leri update etme

  //Pool validasyonlarından geçirme
  if (values.length > 0) {
    const waitingCommitmentList: CTXFinderResult[] = values.filter((value: CTXFinderResult) => !value.transaction.txid);
    const waitingPoolTxList: CTXFinderResult[] = values.filter((value: CTXFinderResult) => value.transaction.txid);

    if (waitingCommitmentList.length > 0) {
      const ps = await pools();

      if (ps.length > 0) {
        for (let i = 0; i < waitingCommitmentList.length; i++) {
          const commitmentTx = waitingCommitmentList[i];
          const poolTxId = await validateAndBroadcastPoolTx(commitmentTx, ps);

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
