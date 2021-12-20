import { TxDetail } from "@bitmatrix/esplora-api-client";
import { Pool } from "../../business/data/models/Pool";
import { BmBlockInfo } from "../../business/data/models/BmInfo";
import { isCtxWorker } from "./isCtxWorker";

export const findNewCtxWorker = async (pool: Pool, newBmBlockInfo: BmBlockInfo, newTxDetails: TxDetail[]) => {
  try {
    console.log("Find new ctx worker started for pool: " + pool.id + ", newBlockheight: " + newBmBlockInfo.block_height);
    console.log("Tx count: " + newTxDetails.length);

    if (newTxDetails.length === 1) return;

    for (let i = 1; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
      isCtxWorker(pool, newBmBlockInfo, newTxDetail);
    }
  } catch (error) {
    console.error("findNewCtxWorker.error", error);
  }
};
