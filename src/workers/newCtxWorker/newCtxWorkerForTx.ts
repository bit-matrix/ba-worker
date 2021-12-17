import { Pool } from "../../business/data/models/Pool";
import { TxDetail } from "@bitmatrix/esplora-api-client";

export const newCtxWorkerForTx = async (pool: Pool, newBlockheight: number, newBlockHash: string, tx: TxDetail) => {
  console.log("New ctx worker for tx started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight + ", txid: " + tx.txid);
};
