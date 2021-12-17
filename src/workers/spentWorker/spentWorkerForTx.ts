import { CommitmentTxData } from "../../business/data/models/CommitmentTxData";
import { Pool } from "../../business/data/models/Pool";

export const spentWorkerForTx = async (pool: Pool, newBlockheight: number, burnBlockHash: string, txid: string, data: CommitmentTxData): Promise<string | undefined> => {
  console.log(
    "Spent worker for Tx started for pool: " +
      pool.asset +
      ". newBlockheight: " +
      newBlockheight +
      ", ctx.burnBlockHeight: " +
      burnBlockHash +
      ", ctx.txid: " +
      txid +
      ", ctx.data.call: " +
      data.CALL_METHOD
  );

  return "";
};
