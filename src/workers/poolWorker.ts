import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BmBlockInfo, BmCtxNew, Pool, PoolValues } from "@bitmatrix/models";
import { ctxsNew, poolUpdate } from "../business/data";
import { createPoolTxWorker } from "./createPoolTxWorker";
import { findNewCtxWorker } from "./findNewCtxWorker";
import { findNewPtxWorker } from "./findNewPtxWorker";

export const poolWorker = async (pool: Pool, newBmBlockInfo: BmBlockInfo, newTxDetails: TxDetail[], recentBlockheight: number) => {
  // console.log("Pool worker started for " + pool.id + ". newBlockHeight: " + newBmBlockInfo.block_height);
  console.log("Pool worker started");

  try {
    /**
     *
     * 1. new commitment txs
     *
     **/
    await findNewCtxWorker(pool, newBmBlockInfo, newTxDetails);

    /**
     *
     * 2. create pool tx
     *
     **/
    if (newBmBlockInfo.block_height === recentBlockheight) {
      const newCtxs: BmCtxNew[] = await ctxsNew(pool.id);
      await createPoolTxWorker(pool, newBmBlockInfo, newCtxs);
    }

    /**
     *
     * 3. find new pool tx
     *
     **/
    const poolValues: PoolValues | undefined = await findNewPtxWorker(pool, newBmBlockInfo, newTxDetails);

    /**
     *
     * 4. update pool data
     *
     **/
    const newPool: Pool = { ...pool };

    newPool.syncedBlock = newBmBlockInfo;
    newPool.synced = newBmBlockInfo.block_height === recentBlockheight;

    newPool.recentBlockHeight = recentBlockheight;

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
