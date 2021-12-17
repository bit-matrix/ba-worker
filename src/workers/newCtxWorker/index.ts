import { activeCtx } from "../../business/data";
import { Pool } from "../../business/data/models/Pool";

export const newCtxWorker = async (pool: Pool, newBlockheight: number) => {
  console.log("New ctx worker started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight);
};
