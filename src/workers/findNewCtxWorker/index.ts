import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, Pool } from "@bitmatrix/models";
import { config } from "../../business/db-client";
import { isNewCtxWorker } from "./ctxWorker";

export const findNewCtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  try {
    // console.log("Find new ctx worker started for pool: " + pool.id + ", newBlockheight: " + newBmBlockInfo.block_height);
    // console.log("Find new ctx worker started");
    // console.log("Tx count: " + newTxDetails.length);

    const poolConfig: BmConfig = await config(pool.id);

    for (let i = 0; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
      await isNewCtxWorker(pool, poolConfig, newTxDetail, newBlock);
    }
  } catch (error) {
    console.error("findNewCtxWorker.error", error);
  }
};
