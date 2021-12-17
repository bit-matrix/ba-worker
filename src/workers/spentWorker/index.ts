import { esploraClient } from "@bitmatrix/esplora-api-client";
import { activeCtx } from "../../business/data";
import { Pool } from "../../business/data/models/Pool";
import { spentWorkerForCtx } from "./spentWorkerForCtx";

export const spentWorker = async (pool: Pool, newBlockheight: number) => {
  console.log("Spent worker started for pool: " + pool.asset + ". newBlockheight: " + newBlockheight);

  const ctxs = await activeCtx(pool.asset);
  console.log(ctxs.length + " found for asset: " + pool.asset);
  if (ctxs.length === 0) return;

  ctxs.forEach(async (ctx) => {
    await spentWorkerForCtx(pool, newBlockheight, ctx);
  });
};
