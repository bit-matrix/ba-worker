import { pools } from "../business/db-client";
import { init, esploraClient, TxDetail, Block } from "@bitmatrix/esplora-api-client";
import { poolWorker } from "./poolWorker";
import { WORKER_DELAY } from "../env";
import { BmBlockInfo } from "@bitmatrix/models";

const worker = async () => {
  try {
    console.log("worker started..");

    // recentBlock
    const recentBlock10 = await esploraClient.blocks();
    const recentBlock = recentBlock10[0];
    console.log("recentBlock.height: ", recentBlock.height);

    const ps = await pools();
    const promises: Promise<void>[] = [];

    ps.forEach(async (p) => {
      const diff = recentBlock.height - p.syncedBlock.block_height;
      if (diff === 0) return;

      let newBlock: Block;
      if (diff < 10) {
        newBlock = recentBlock10[diff];
      } else {
        const block10 = await esploraClient.blocks(p.syncedBlock.block_height + 1);
        newBlock = block10[0];
      }
      console.log("newBlockHeight: ", newBlock.height);

      const poolWorkerPromise = poolWorker(p, newBlock, recentBlock);
      promises.push(poolWorkerPromise);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("worker.error", error);
  } finally {
    setTimeout(worker, WORKER_DELAY * 1000);
  }
};

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.bitmatrix-aggregate.com/");
  worker();
};
