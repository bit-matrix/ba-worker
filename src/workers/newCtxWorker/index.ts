import { esploraClient } from "@bitmatrix/esplora-api-client";
import { Pool } from "../../business/data/models/Pool";
import { newCtxWorkerForTx } from "./newCtxWorkerForTx";

export const newCtxWorker = async (pool: Pool, newBlockheight: number) => {
  try {
    console.log("New ctx worker started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight);

    const newBlockHash = await esploraClient.blockheight(newBlockheight);
    const txs = await esploraClient.blockTxs(newBlockHash);

    console.log("New ctx worker started for newBlockheight: " + newBlockheight + ", blockHash: " + blockHash + ", txs.length: " + txs.length);
    if (txs.length === 1) return;

    for (let i = 1; i < txs.length; i++) {
      const tx = txs[i];
      newCtxWorkerForTx(pool, newBlockheight, newBlockHash, tx);
    }
  } catch (error) {
    console.error("newCtxWorker.error", newCtxWorker);
  }
};
