import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, Pool, PoolValues } from "@bitmatrix/models";
import { config, ctxsNew, poolUpdate } from "../business/db-client";
import { clearCtxSpents } from "../helper/clearSpents";
import { createPoolTxWorker } from "./createPoolTxWorker";
import { findNewCtxWorker } from "./findNewCtxWorker";
import { findNewPtxWorker } from "./findNewPtxWorker";

export const poolWorker = async (pool: Pool, newBlock: Block, bestBlock: Block) => {
  // console.log("Pool worker started for " + pool.id + ". newBlockHeight: " + newBmBlockInfo.block_height);
  // console.log("Pool worker started");

  let synced = newBlock.height === bestBlock.height;
  let poolConfig: BmConfig = await config();

  // console.log("newBlock.tx_count", newBlock.tx_count);
  let newTxDetails: TxDetail[] = [];
  if (newBlock.tx_count > 1) {
    newTxDetails = await esploraClient.blockTxs(newBlock.id);
    newTxDetails = newTxDetails.slice(1);
  }

  try {
    /**
     *
     * 1. new commitment txs
     *
     **/
    if (newBlock.tx_count > 1) {
      // old
      // await findNewCtxWorker(pool, newBlock, newTxDetails, poolConfig);
      // new
    }

    /**
     *
     * 2. create pool tx
     *
     **/
    let lastSentPtx: string | undefined = pool.lastSentPtx;
    if (synced && pool.unspentTx && lastSentPtx === undefined) {
      let newCtxs: BmCtxNew[] = await ctxsNew(pool.id);
      newCtxs = await clearCtxSpents(pool, newCtxs);
      const bmNewPtxResult = await createPoolTxWorker(pool, newBlock, newCtxs, poolConfig);
      lastSentPtx = bmNewPtxResult?.poolTx;
    }

    /**
     *
     * 3. find new pool tx
     *
     **/
    let poolValues: PoolValues | undefined;
    if (newBlock.tx_count > 1) {
      poolValues = await findNewPtxWorker(pool, newBlock, newTxDetails, synced);
    }

    /**
     *
     * 4. update pool data
     *
     **/
    const newPool: Pool = { ...pool };

    newPool.lastSentPtx = lastSentPtx;

    if (poolValues) {
      newPool.quote.value = poolValues.quote;
      newPool.token.value = poolValues.token;
      newPool.lp.value = poolValues.lp;

      newPool.unspentTx = poolValues.unspent ? poolValues.ptxInfo : undefined;

      if (newPool.lastSentPtx === poolValues.ptxInfo.txid) newPool.lastSentPtx = undefined;
    }

    const res = await poolUpdate(newPool);
    // console.log(res);
  } catch (error) {
    console.error("poolWorker.error", error);
  }

  return;
};
