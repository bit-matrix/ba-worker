import { Block } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CALL_METHOD, Pool } from "@bitmatrix/models";
import { config } from "../../business/db-client";
import { method01 } from "./method01";
import { method02 } from "./method02";
import { method03 } from "./method03";
import { method04 } from "./method04";

export const createPoolTxWorker = async (pool: Pool, newBlock: Block, newCtxs: BmCtxNew[]) => {
  console.log("Create ptx worker for newCtxs started for pool: " + pool.id + ". newBlockheight: " + newBlock.height + ", newCtxs.count: " + newCtxs.length);
  if (newCtxs.length === 0) return;

  const sortedNewCtxs = newCtxs.sort((a, b) => b.callData.orderingFee - a.callData.orderingFee);
  const ctxNew: BmCtxNew = sortedNewCtxs[0];
  console.log("bestCtx for pool tx: ", ctxNew.commitmentTx.txid);

  const poolConfig: BmConfig = await config(pool.id);

  if (ctxNew.callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
    await method01(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) {
    await method02(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.ADD_LIQUIDITY) {
    await method03(pool, poolConfig, ctxNew);
  } else if (ctxNew.callData.method === CALL_METHOD.REMOVE_LIQUIDITY) {
    await method04(pool, poolConfig, ctxNew);
  }

  // const compiledData = "20" + hexLE(targetFlagAssetId) + "766b6b6351b27500c8696c876700c8696c87916960b27521" + recipientPublicKey + "ac68";

  // TODO
};
