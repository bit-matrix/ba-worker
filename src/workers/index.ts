import { getLastAppSyncState, pools, updateAppSyncState } from "../business/db-client";
import { init, esploraClient } from "@bitmatrix/esplora-api-client";
import { AppSync } from "@bitmatrix/models";
import { poolRegisteryWorker } from "./v2/findPoolRegistery";
import * as nodeCron from "node-cron";
import { v2CtxPtxWorker } from "./v2/v2CtxPtxWorker";
import { redisInit } from "../redisClient/redisInit";

const getFinalBlockDetail = async () => {
  const appLastState = await getLastAppSyncState();

  // app synced state
  if (appLastState.synced) {
    const bestBlockHeight = await esploraClient.blockTipHeight();
    const bestBlockHash = await esploraClient.blockheight(bestBlockHeight);

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    // new block found
    if (bestBlockHeight - appLastState.blockHeight === 1) {
      await v2CtxPtxWorker(bestBlockHash);
      await poolRegisteryWorker(bestBlockHeight, bestBlockHash);

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

    if (bestBlockHeight < appLastState.blockHeight) throw "block height is less than last block height , something went wrong";

    if (bestBlockHeight > appLastState.blockHeight) {
      const nextBlockHeight = appLastState.blockHeight + 1;

      const nextBlockHash = await esploraClient.blockheight(nextBlockHeight);

      await v2CtxPtxWorker(nextBlockHash);
      await poolRegisteryWorker(nextBlockHeight, nextBlockHash);

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

nodeCron.schedule("*/15 * * * * *", async () => {
  await getFinalBlockDetail();
});

export const startWorkers = async () => {
  console.log("startWorkers started...");
  init("https://electrs.basebitmatrix.com/");
  redisInit("redis://localhost:6379");
  appWorker();
};
