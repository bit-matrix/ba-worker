import { pools } from "../business/db-client";
import { init, esploraClient, Block } from "@bitmatrix/esplora-api-client";
import { poolWorker } from "./poolWorker";
import { WORKER_DELAY } from "../env";
import { getNewBlock } from "../helper/getNewBlock";

const worker = async () => {
  try {
    console.log("worker started..");

    const bestBlock10 = await esploraClient.blocks();

    const ps = await pools();
    const promises: Promise<void>[] = [];

    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.active) {
        const wantedNewBlockHeight = p.lastSyncedBlock.block_height + 1;
        const blockData = await getNewBlock(bestBlock10, wantedNewBlockHeight);

        if (blockData) {
          const { newBlock, bestBlock } = blockData;
          const poolWorkerPromise = poolWorker(p, newBlock, bestBlock);
          promises.push(poolWorkerPromise);
        }
      }
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("worker.error", error);
  } finally {
    setTimeout(worker, WORKER_DELAY * 1000);
  }
};

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.basebitmatrix.com/");
  worker();
};
