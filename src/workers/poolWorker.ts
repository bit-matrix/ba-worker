import { Pool } from "../business/data/models/Pool";
import { ctxNewWorker } from "./ctxNewWorker";
import { ctxSpentWorker } from "./ctxSpentWorker";

export const poolWorker = async (pool: Pool, newBlockheightCTX?: number, newBlockheightPTX?: number) => {
  console.log("Pool worker started for " + pool.asset + ". ctx: " + newBlockheightCTX + ", ptx: " + newBlockheightPTX);

  if (newBlockheightPTX) {
    await ctxSpentWorker(pool, newBlockheightPTX);
  }

  if (newBlockheightCTX) {
    await ctxNewWorker(pool, newBlockheightCTX);
  }

  return;
};
