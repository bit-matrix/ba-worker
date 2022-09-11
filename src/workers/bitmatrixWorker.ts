import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { commitmentWorker } from "./commitmentWorker";
import { isCtxSpentWorker } from "./isCtxSpentWorker";
import { nftHunterWorker } from "./nftHunterWorker";
import { poolRegisteryWorker } from "./poolRegisteryWorker";
import { poolTxWorker } from "./poolTxWorker";

export const bitmatrixWorker = async (newBlockHash: string, synced: boolean) => {
  try {
    console.log("bitmatrix worker started..");

    let newTxDetails: TxDetail[] = [];

    newTxDetails = await esploraClient.blockTxs(newBlockHash);

    newTxDetails = newTxDetails.slice(1); // for coinbase transaction

    if (newTxDetails.length > 0) {
      console.log("welcome to new tx ..");

      await nftHunterWorker(newTxDetails, synced);

      const waitingTxs = await redisClient.getAllValues<BitmatrixStoreData>();

      await isCtxSpentWorker(waitingTxs, synced);

      await commitmentWorker(newTxDetails, synced);

      await poolRegisteryWorker(newTxDetails, synced);
    }

    if (synced) await poolTxWorker();
  } catch (error) {
    console.error("worker.error", error);
  }
};
