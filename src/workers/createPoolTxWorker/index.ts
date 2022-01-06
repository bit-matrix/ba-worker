import { Block } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CALL_METHOD, Pool } from "@bitmatrix/models";
import { config, ctxMempoolSave } from "../../business/db-client";
import { method01 } from "./method01";
import { method02 } from "./method02";
import { method03 } from "./method03";
import { method04 } from "./method04";

export const createPoolTxWorker = async (pool: Pool, newBlock: Block, newCtxs: BmCtxNew[]): Promise<string | undefined> => {
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBlock.height + ", newCtxs.count: " + newCtxs.length);

  if (newCtxs.length === 0) return;

  // TODO
  // if(pool.sentPtx)  return;

  const sortedNewCtxs = newCtxs.sort((a, b) => b.callData.orderingFee - a.callData.orderingFee);
  const ctxNew: BmCtxNew = sortedNewCtxs[0];
  console.log("bestCtx for pool tx: ", ctxNew.commitmentTx.txid);

  const poolConfig: BmConfig = await config(pool.id);

  let ptxid: string | undefined = undefined;
  if (ctxNew.callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    ptxid = await method01(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
    ptxid = await method02(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.ADD_LIQUIDITY) {
    ptxid = await method03(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.REMOVE_LIQUIDITY) {
    // ptxid = await method04(pool, poolConfig, ctxNew);
  }

  if (ptxid) await ctxMempoolSave(pool.id, { callData: ctxNew.callData, output: ctxNew.output, commitmentTx: ctxNew.commitmentTx, poolTxid: ptxid });

  return ptxid;
};
