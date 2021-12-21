import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmCtxNew, Pool, PoolValues } from "@bitmatrix/models";
import { ctxsNew, poolUpdate } from "../business/db-client";
import { createPoolTxWorker } from "./createPoolTxWorker";
import { findNewCtxWorker } from "./findNewCtxWorker";
import { findNewPtxWorker } from "./findNewPtxWorker";

export const poolWorker = async (pool: Pool, newBlock: Block, recentBlock: Block) => {
  // console.log("Pool worker started for " + pool.id + ". newBlockHeight: " + newBmBlockInfo.block_height);
  console.log("Pool worker started");

  const synced = newBlock.height === recentBlock.height;

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
    if (synced) {
      const newCtxs: BmCtxNew[] = await ctxsNew(pool.id);
      await createPoolTxWorker(pool, newBlock, newCtxs);
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

    newPool.syncedBlock = { block_height: newBlock.height, block_hash: newBlock.id };
    newPool.synced = synced;

    newPool.recentBlockHeight = recentBlock.height;

    if (poolValues) {
      newPool.quote.value = poolValues.quote;
      newPool.token.value = poolValues.token;
      newPool.lp.value = poolValues.lp;

      newPool.unspentTx = poolValues.unspentTx;
    }
    // console.log("Pool update: ", newPool);
    await poolUpdate(newPool);
  } catch (error) {
    console.error("poolWorker.error", error);
  }

  return;
};
