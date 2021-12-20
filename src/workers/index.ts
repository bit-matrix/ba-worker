import { pools } from "../business/data";
import { init, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { poolWorker } from "./poolWorker";
import { BmBlockInfo } from "../business/data/models/BmInfo";
import { WORKER_DELAY } from "../env";

const worker = async () => {
  try {
    console.log("worker started..");

    // recentBlockheight
    const recentBlockheight = await esploraClient.blockTipHeight();
    console.log("recentBlockheight: ", recentBlockheight);

    const ps = await pools();
    // console.log("found pool assets: " + ps.map((p) => p.id).join(","));

    const promises: Promise<void>[] = [];

    ps.forEach(async (p) => {
      const newBlockHeight: number | undefined = p.syncedBlock.block_height < recentBlockheight ? p.syncedBlock.block_height + 1 : undefined;
      console.log("newBlockHeight: ", newBlockHeight);

      if (newBlockHeight) {
        const newBlockHash = await esploraClient.blockheight(newBlockHeight);
        const txDetails: TxDetail[] = await esploraClient.blockTxs(newBlockHash);
        const bmBlockInfo: BmBlockInfo = { block_height: newBlockHeight, block_hash: newBlockHash };

        const poolWorkerPromise = poolWorker(p, bmBlockInfo, txDetails, recentBlockheight);
        promises.push(poolWorkerPromise);
      }
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
