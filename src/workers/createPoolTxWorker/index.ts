import { Block } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, BmNewPtxResult, Pool } from "@bitmatrix/models";
import { config, ctxMempoolSave } from "../../business/db-client";
import { topCtxs } from "./helper/common";
import { createPoolTx } from "./createPoolTx";

export const createPoolTxWorker = async (pool: Pool, newBlock: Block, newCtxs: BmCtxNew[], poolConfig: BmConfig): Promise<BmNewPtxResult | undefined> => {
  if (newCtxs.length === 0) return;
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBlock.height + ", newCtxs.count: " + newCtxs.length);

  const bestCtxs: BmCtxNew[] = topCtxs(newCtxs, pool.maxLeaf);
  console.log(bestCtxs.length + " bestCtxs for pool tx: ", bestCtxs.map((c) => c.commitmentTx.txid).join(","));

  const bmNewPtxResult: BmNewPtxResult = await createPoolTx(pool, poolConfig, bestCtxs);

  if (bmNewPtxResult.poolTx) {
    for (let i = 0; i < bestCtxs.length; i++) {
      const ctxNew = bestCtxs[i];

      await ctxMempoolSave(pool.id, {
        callData: ctxNew.callData,
        output: ctxNew.output,
        commitmentTx: ctxNew.commitmentTx,
        poolTxid: bmNewPtxResult.poolTx,
        isOutOfSlippage: bmNewPtxResult.ctxsResult[i].isOutOfSlippage,
      });
    }
  }

  return bmNewPtxResult;
};
