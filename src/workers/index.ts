import { getLastAppSyncState, pools, updateAppSyncState } from "../business/db-client";
import { init, esploraClient, Block } from "@bitmatrix/esplora-api-client";
import { WORKER_DELAY } from "../env";
import { getNewBlock } from "../helper/getNewBlock";
import { poolRegisteryWorker } from "./findPoolRegistery";
import { poolWorker } from "./poolWorker";
import * as nodeCron from "node-cron";
import { AppSync } from "../appSync";

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

const getFinalBlockDetail = async () => {
  const bestBlockHeight = await esploraClient.blockTipHeight();
  const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);
  const appLastState = await getLastAppSyncState("1");

  if (appLastState.synced && bestBlockHeight - appLastState.blockHeight === 1) {
    await poolRegisteryWorker(bestBlockHeight, bestBlockHash);

    const newDbState: AppSync = { id: "1", blockHash: bestBlockHash, blockHeight: bestBlockHeight, synced: true };
    await updateAppSyncState(newDbState);
  } else if (appLastState.synced && bestBlockHeight - appLastState.blockHeight > 1) {
    appWorker();
  }
};

nodeCron.schedule("*/10 * * * * *", () => {
  getFinalBlockDetail();
});

const appWorker = async () => {
  console.log("app syncer started..");

  try {
    const bestblock = await esploraClient.blockTipHeight();

    const appLastState = await getLastAppSyncState("1");

    if (bestblock > appLastState.blockHeight) {
      console.log("case1", "bestblock : ", bestblock, "lastblock : ", appLastState.blockHeight);

      const nextBlockHeight = appLastState.blockHeight + 1;

      const nextBlockHash = await esploraClient.blockheight(nextBlockHeight);

      await poolRegisteryWorker(nextBlockHeight, nextBlockHash);

      const newDbState: AppSync = { id: "1", blockHash: nextBlockHash, blockHeight: nextBlockHeight, synced: false };

      await updateAppSyncState(newDbState);

      appWorker();
    } else if (bestblock === appLastState.blockHeight) {
      const newDbState: AppSync = { ...appLastState, synced: true };

      await updateAppSyncState(newDbState);
    }
  } catch (error) {
    console.error("appWorker.error", error);
  }
};

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.basebitmatrix.com/");
  // worker();
  appWorker();
};
