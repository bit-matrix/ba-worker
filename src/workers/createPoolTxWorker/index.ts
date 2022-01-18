import { Block } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { config, ctxMempoolSave } from "../../business/db-client";
import { topCtxs } from "./helper/common";
import { createPoolTx } from "./createPoolTx";

export const createPoolTxWorker = async (pool: Pool, newBlock: Block, newCtxs: BmCtxNew[]): Promise<string | undefined> => {
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBlock.height + ", newCtxs.count: " + newCtxs.length);

  if (newCtxs.length === 0) return;

  const sortedNewCtxs = topCtxs(newCtxs, 1);
  const ctxNews: BmCtxNew[] = sortedNewCtxs.slice(0, 2);
  console.log(ctxNews.length + " bestCtxs for pool tx: ", ctxNews.map((c) => c.commitmentTx.txid).join(","));

  const poolConfig: BmConfig = await config(pool.id);

  const ptxid: string | undefined = await createPoolTx(pool, poolConfig, newCtxs);

  if (ptxid) {
    for (let i = 0; i < newCtxs.length; i++) {
      const ctxNew = newCtxs[i];
      await ctxMempoolSave(pool.id, { callData: ctxNew.callData, output: ctxNew.output, commitmentTx: ctxNew.commitmentTx, poolTxid: ptxid });
    }
  }

  return ptxid;
};
