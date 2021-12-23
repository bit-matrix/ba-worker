import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { Pool, PoolValues } from "@bitmatrix/models";
import { isPtxWorker } from "./ptxWorker";

export const findNewPtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  console.log("Find new ptx worker started");

  let poolValues: PoolValues | undefined = undefined;
  for (let i = 0; i < newTxDetails.length; i++) {
    if (poolValues === undefined) {
      const ntx = newTxDetails[i];
      poolValues = await isPtxWorker(pool, newBlock, ntx);
    } else {
      break;
    }
  }
  return poolValues;
};
