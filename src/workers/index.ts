import { getLastAppSyncState, updateAppSyncState } from "../business/db-client";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { AppSync } from "@bitmatrix/models";
import * as nodeCron from "node-cron";
import { bitmatrixWorker } from "./bitmatrixWorker";
import { redisInit } from "@bitmatrix/redis-client";
import { ELECTRS_URL, REDIS_URL } from "../env";
import { setIntervalAsync, clearIntervalAsync, SetIntervalAsyncTimer } from "set-interval-async";

const getFinalBlockDetail = async (timer: SetIntervalAsyncTimer<[]>) => {
  const appLastState = await getLastAppSyncState();

  // app synced state
  if (appLastState.synced) {
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    // new block found
    if (bestBlockHeight - appLastState.blockHeight === 1) {
      await bitmatrixWorker(bestBlockHash, true);

      const newDbState: AppSync = { bestBlockHeight, blockHash: bestBlockHash, blockHeight: bestBlockHeight, synced: true };
      await updateAppSyncState(newDbState);

      await clearIntervalAsync(timer);

      console.log("sync completed");
    }
    // synced app restarted
    else if (bestBlockHeight - appLastState.blockHeight > 1) {
      appWorker();
      await clearIntervalAsync(timer);
    }
  } else {
    await clearIntervalAsync(timer);
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

      const newDbState: AppSync = { bestBlockHeight, blockHash: nextBlockHash, blockHeight: nextBlockHeight, synced: false };

      await updateAppSyncState(newDbState);

      appWorker();
    } else if (bestBlockHeight === appLastState.blockHeight) {
      const newDbState: AppSync = { ...appLastState, synced: true };

      await bitmatrixWorker(appLastState.blockHash, true);

      await updateAppSyncState(newDbState);
    }
  } catch (error) {
    console.error("appWorker.error", error);
  }
};

nodeCron.schedule("50 * * * * *", () => {
  const interval = setIntervalAsync(async () => {
    await getFinalBlockDetail(interval);
  }, 1000);
});

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init(ELECTRS_URL);
  redisInit(REDIS_URL);
  appWorker();
};
