import { Pool } from "../business/data/models/Pool";
import { newCtxWorker } from "./newCtxWorker";
import { spentWorker } from "./spentWorker";

export const poolWorker = async (pool: Pool, newBlockheightCTX?: number, newBlockheightPTX?: number) => {
  console.log("Pool worker started for " + pool.asset + ". ctx: " + newBlockheightCTX + ", ptx: " + newBlockheightPTX);

  if (newBlockheightPTX) {
    await spentWorker(pool, newBlockheightPTX);
  }

  if (newBlockheightCTX) {
    await newCtxWorker(pool, newBlockheightCTX);
  }

  return;
};
