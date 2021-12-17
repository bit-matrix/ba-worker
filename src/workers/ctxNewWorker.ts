import { Pool } from "../business/data/models/Pool";

export const ctxNewWorker = async (pool: Pool, newBlockheight: number) => {
  console.log("Ctx new worker started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight);
};
