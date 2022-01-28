import { Block } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { config, ctxMempoolSave } from "../../business/db-client";
import { topCtxs } from "./helper/common";
import { createPoolTx } from "./createPoolTx";

export const createPoolTxWorker = async (pool: Pool, newBlock: Block, newCtxs: BmCtxNew[]): Promise<string | undefined> => {
  if (newCtxs.length === 0) return;
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBlock.height + ", newCtxs.count: " + newCtxs.length);

  const poolConfig: BmConfig = await config(pool.id);

  const bestCtxs: BmCtxNew[] = topCtxs(newCtxs, poolConfig.maxLeaf);
  console.log(bestCtxs.length + " bestCtxs for pool tx: ", bestCtxs.map((c) => c.commitmentTx.txid).join(","));

  const ptxid: string | undefined = await createPoolTx(pool, poolConfig, bestCtxs);

  if (ptxid) {
    for (let i = 0; i < bestCtxs.length; i++) {
      const ctxNew = bestCtxs[i];

      await ctxMempoolSave(pool.id, { callData: ctxNew.callData, output: ctxNew.output, commitmentTx: ctxNew.commitmentTx, poolTxid: ptxid });
    }
  }

  return ptxid;
};
