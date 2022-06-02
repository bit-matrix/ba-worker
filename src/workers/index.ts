import { getLastAppSyncState, pools, updateAppSyncState } from "../business/db-client";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { WORKER_DELAY } from "../env";
import { poolRegisteryWorker } from "./findPoolRegistery";
import { poolWorker } from "./poolWorker";
import * as nodeCron from "node-cron";
import { AppSync } from "../appSync";

const worker = async (newBlockHash: string, bestBlockHash: string) => {
  try {
    console.log("pool tx , commitment tx worker started..");

    const ps = await pools();
    const promises: Promise<void>[] = [];
    const newBlock = await esploraClient.block(newBlockHash);
    const bestBlock = await esploraClient.block(newBlockHash);

    for (let i = 0; i < ps.length; i++) {
      const p = ps[i];
      if (p.active) {
        const poolWorkerPromise = poolWorker(p, newBlock, bestBlock);
        promises.push(poolWorkerPromise);
      }
    }

    await Promise.all(promises);
  } catch (error) {
    console.error("worker.error", error);
  }
};

const getFinalBlockDetail = async () => {
  const bestBlockHeight = await esploraClient.blockTipHeight();
  const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

  console.log("bestBlockHeight", bestBlockHeight);
  console.log("bestBlockHash", bestBlockHash);

  const appLastState = await getLastAppSyncState("1");

  if (appLastState.synced && bestBlockHeight - appLastState.blockHeight === 1) {
    await poolRegisteryWorker(bestBlockHeight, bestBlockHash);
    await worker(appLastState.blockHash, bestBlockHash);

    const newDbState: AppSync = { id: "1", blockHash: bestBlockHash, blockHeight: bestBlockHeight, synced: true };
    await updateAppSyncState(newDbState);
  } else if (appLastState.synced && bestBlockHeight - appLastState.blockHeight > 1) {
    appWorker();
  }
};

const appWorker = async () => {
  console.log("app syncer started..");

  try {
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    const appLastState = await getLastAppSyncState("1");

    if (bestBlockHeight > appLastState.blockHeight) {
      console.log("case1", "bestblock : ", bestBlockHeight, "lastblock : ", appLastState.blockHeight);

      const nextBlockHeight = appLastState.blockHeight + 1;

      const nextBlockHash = await esploraClient.blockheight(nextBlockHeight);

      await poolRegisteryWorker(nextBlockHeight, nextBlockHash);
      await worker(appLastState.blockHash, bestBlockHash);

      const newDbState: AppSync = { id: "1", blockHash: nextBlockHash, blockHeight: nextBlockHeight, synced: false };

      await updateAppSyncState(newDbState);

      appWorker();
    } else if (bestBlockHeight === appLastState.blockHeight) {
      const newDbState: AppSync = { ...appLastState, synced: true };

      await updateAppSyncState(newDbState);
    }
  } catch (error) {
    console.error("appWorker.error", error);
  }
};

nodeCron.schedule("*/10 * * * * *", () => {
  getFinalBlockDetail();
});

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.basebitmatrix.com/");
};
