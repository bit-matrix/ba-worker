import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmBlockInfo, BmCtxMempool, Pool, PoolValues } from "@bitmatrix/models";
import { ctxsMempool, ctxsNew } from "../../business/db-client";
// import { spentWorkerForCtx } from "./spentWorkerForCtx";

export const findNewPtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  // console.log("Find new ptx worker started for pool: " + pool.id + ". newBlockheight: " + newBmBlockInfo.block_height);
  console.log("Find new ptx worker started");
  let poolValues: PoolValues;

  const mempoolCtxs: BmCtxMempool[] = await ctxsMempool(pool.id);
  // console.log(mempoolCtxs.length + " new mempool ctxs found for asset: " + pool.id);
  console.log("mempool ctxs: ", mempoolCtxs.length);

  // If I didn't create a pool tx, I don't interest with it !!!
  if (mempoolCtxs.length === 0) return;

  /* ctxs.forEach(async (ctx) => {
    await spentWorkerForCtx(pool, newBlockheight, ctx);
  }); */

  poolValues = {
    quote: "1005000",
    token: "49753000000",
    lp: "1999990000",
    unspentTx: {
      txid: "3d9bc4c1b203536406c129a24c3a14475d781972e4edd861eaad279358637954",
      block_hash: "721d3a1c587ad367bc8982ba9cb0e36c4136efdd1f240f286c9bc19504f3cb69",
      block_height: 131275,
    },
  };

  return poolValues;
};
