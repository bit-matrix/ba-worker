import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmCtxNew, Pool, PoolValues } from "@bitmatrix/models";
import { ctxsNew, poolUpdate } from "../business/db-client";
import { createPoolTxWorker } from "./createPoolTxWorker";
import { findNewCtxWorker } from "./findNewCtxWorker";
import { findNewPtxWorker } from "./findNewPtxWorker";
import { updateConfirmedCtxMempools } from "./updateConfirmedCtxMempools";

export const poolWorker = async (pool: Pool, newBlock: Block, bestBlock: Block) => {
  // console.log("Pool worker started for " + pool.id + ". newBlockHeight: " + newBmBlockInfo.block_height);
  // console.log("Pool worker started");

  let synced = newBlock.height === bestBlock.height;

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
      await findNewCtxWorker(pool, newBlock, newTxDetails);
    }

    /**
     *
     * 2. create pool tx
     *
     **/
    let lastSentPtx: string | undefined = pool.lastSentPtx;
    if (synced && lastSentPtx === undefined) {
      const newCtxs: BmCtxNew[] = await ctxsNew(pool.id);
      lastSentPtx = await createPoolTxWorker(pool, newBlock, newCtxs);
    }

    /**
     *
     * 3. find new pool tx
     *
     **/
    let poolValues: PoolValues | undefined;
    if (newBlock.tx_count > 1) {
      poolValues = await findNewPtxWorker(pool, newBlock, newTxDetails);
    }

    /**
     *
     * 4. update pool data
     *
     **/
    const newPool: Pool = { ...pool };

    newPool.lastSyncedBlock = { block_height: newBlock.height, block_hash: newBlock.id };
    newPool.synced = synced;
    newPool.lastSentPtx = lastSentPtx;

    newPool.bestBlockHeight = bestBlock.height;

    if (poolValues) {
      newPool.quote.value = poolValues.quote;
      newPool.token.value = poolValues.token;
      newPool.lp.value = poolValues.lp;

      newPool.lastUnspentTx = poolValues.unspentTx;

      if (lastSentPtx === newPool.lastUnspentTx.txid) lastSentPtx = undefined;

      await updateConfirmedCtxMempools(pool.id, newPool.lastUnspentTx.txid, newBlock);
    }

    // console.log("Pool update: ", newPool);
    const res = await poolUpdate(newPool);
    // console.log(res);
  } catch (error) {
    console.error("poolWorker.error", error);
  }

  return;
};
