import { getLastAppSyncState, updateAppSyncState } from "../business/db-client";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { AppSync } from "@bitmatrix/models";
import * as nodeCron from "node-cron";
import { bitmatrixWorker } from "./bitmatrixWorker";
import { redisInit } from "@bitmatrix/redis-client";

const getFinalBlockDetail = async (timer: NodeJS.Timer) => {
  const appLastState = await getLastAppSyncState();
  console.log("1");
  // app synced state
  if (appLastState.synced) {
    console.log("2");
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    // new block found
    if (bestBlockHeight - appLastState.blockHeight === 1) {
      console.log("3");
      await bitmatrixWorker(bestBlockHash, true);

      const newDbState: AppSync = { blockHash: bestBlockHash, blockHeight: bestBlockHeight, synced: true };
      await updateAppSyncState(newDbState);

      console.log("sync completed");

      clearInterval(timer);
    }
    // synced app restarted
    else if (bestBlockHeight - appLastState.blockHeight > 1) {
      appWorker();
      clearInterval(timer);
      console.log("4");
    }
  }
};

const appWorker = async () => {
  console.log("app syncer started..");

  try {
    const appLastState = await getLastAppSyncState();

    // app unsycned state
    const bestBlockHeight = await esploraClient.blockTipHeight();

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    if (bestBlockHeight > appLastState.blockHeight) {
      const nextBlockHeight = appLastState.blockHeight + 1;

      const nextBlockHash = await esploraClient.blockheight(nextBlockHeight);

      await bitmatrixWorker(nextBlockHash, false);

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

nodeCron.schedule("50 * * * * *", () => {
  const interval = setInterval(async () => {
    await getFinalBlockDetail(interval);
  }, 2000);
});

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.basebitmatrix.com/");
  redisInit("redis://localhost:6379");
  appWorker();
};
