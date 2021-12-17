import { CommitmentTx } from "../../business/data/models/CommitmentTx";
import { Pool } from "../../business/data/models/Pool";
import { spentWorkerForTx } from "./spentWorkerForTx";

export const spentWorkerForCtx = async (pool: Pool, newBlockheight: number, ctx: CommitmentTx) => {
  console.log(
    "Spent worker for Ctx started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight + ", ctx.block_height:" + ctx.block_height + ", txs.length: " + ctx.txs.length
  );

  ctx.txs.forEach(async (tx) => {
    const spentTxid = await spentWorkerForTx(pool, newBlockheight, ctx.block_hash, tx.txid, tx.data);
    if (spentTxid) {
      console.log("CTX SPENT! TX ID: " + spentTxid);
    } else {
      console.log("Tx is still unspent :(  txid: " + tx.txid);
    }
  });
};
