import { Pool } from "../business/data/models/Pool";

export const ctxSpentWorker = async (pool: Pool, newBlockheight: number) => {
  console.log("Ctx spent worker started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight);
};
