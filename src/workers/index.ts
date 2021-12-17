import { assetBlockheight, pools } from "../business/data";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { poolWorker } from "./poolWorker";

const worker = async () => {
  try {
    console.log("worker started..");

    // bestBlockheight
    const bestBlockheight = await esploraClient.blockTipHeight();
    console.log("bestBlockheight: ", bestBlockheight);

    const ps = await pools();
    console.log("found pool assets: " + ps.map((p) => p.asset).join(","));

    const promises: Promise<void>[] = [];
    ps.forEach(async (p) => {
      // current pool asset blockheight
      const poolAssetBlockheight = await assetBlockheight(p.asset);
      console.log(p.asset + " poolAssetBlockheight ctx: ", poolAssetBlockheight.ctx.block_height);
      console.log(p.asset + " poolAssetBlockheight ptx: ", poolAssetBlockheight.ptx.block_height);

      const newBlockHeightCTX: number | undefined = poolAssetBlockheight.ctx.block_height < bestBlockheight ? poolAssetBlockheight.ctx.block_height + 1 : undefined;
      const newBlockHeightPTX: number | undefined = poolAssetBlockheight.ptx.block_height < bestBlockheight ? poolAssetBlockheight.ptx.block_height + 1 : undefined;

      const poolWorkerPromise = poolWorker(p, newBlockHeightCTX, newBlockHeightPTX);
      promises.push(poolWorkerPromise);
    });
    await Promise.all(promises);
  } catch (error) {
    console.error("worker.error", error);
  } finally {
    setTimeout(worker, 6 * 1000);
  }
};

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.bitmatrix-aggregate.com/");
  worker();
};
