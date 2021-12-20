import { BmBlockInfo, BmCtxNew, Pool } from "@bitmatrix/models";

export const createPoolTxWorker = async (pool: Pool, newBmBlockInfo: BmBlockInfo, newCtxs: BmCtxNew[]) => {
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBmBlockInfo.block_height + ", newCtxs.count: " + newCtxs.length);
  if (newCtxs.length !== 0) {
    const sortedNewCtxs = newCtxs.sort((a, b) => b.callData.orderingFee - a.callData.orderingFee);
    const bestCtx = sortedNewCtxs[0];
    console.log("bestCtx for pool tx: ", bestCtx.commitmentTx.txid);
    // TODO
  }
};
