import { getLastAppSyncState, pools, updateAppSyncState } from "../business/db-client";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { AppSync } from "@bitmatrix/models";
import { poolRegisteryWorker } from "./findPoolRegistery";
import { poolWorker } from "./poolWorker";
import * as nodeCron from "node-cron";

// bitmatrix tx seperation
const ctxptxworker = async (newBlockHash: string, bestBlockHash: string) => {
  try {
    console.log("pool tx , commitment tx worker started..");

    const ps = await pools();
    const promises: Promise<void>[] = [];
    const newBlock = await esploraClient.block(newBlockHash);
    const bestBlock = await esploraClient.block(bestBlockHash);

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
  const appLastState = await getLastAppSyncState();

  // app synced state
  if (appLastState.synced) {
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    // new block found
    if (bestBlockHeight - appLastState.blockHeight === 1) {
      await poolRegisteryWorker(bestBlockHeight, bestBlockHash);
      await ctxptxworker(appLastState.blockHash, bestBlockHash);

      const newDbState: AppSync = { blockHash: bestBlockHash, blockHeight: bestBlockHeight, synced: true };
      await updateAppSyncState(newDbState);

      console.log("sync completed");
    }
    // synced app restarted
    else if (bestBlockHeight - appLastState.blockHeight > 1) {
      appWorker();
    }
  }
};

const appWorker = async () => {
  console.log("app syncer started..");

  try {
    const appLastState = await getLastAppSyncState();

    // app unsycned state
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    if (bestBlockHeight > appLastState.blockHeight) {
      const nextBlockHeight = appLastState.blockHeight + 1;

      const nextBlockHash = await esploraClient.blockheight(nextBlockHeight);

      await poolRegisteryWorker(nextBlockHeight, nextBlockHash);
      await ctxptxworker(appLastState.blockHash, bestBlockHash);

      const newDbState: AppSync = { blockHash: nextBlockHash, blockHeight: nextBlockHeight, synced: false };

      await updateAppSyncState(newDbState);

      appWorker();
    } else if (bestBlockHeight === appLastState.blockHeight) {
      console.log("block çektim eşitledim update ediyorum statei");
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
  appWorker();
};
