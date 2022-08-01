import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { pools } from "../business/db-client";
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

      // nft avcısı worker -> pool'u update edecek
      await nftHunterWorker(newTxDetails, synced);
      await isCtxSpentWorker(synced);

      const ps = await pools();

      await commitmentWorker(ps, newTxDetails, synced);

      if (synced) await poolTxWorker(ps);

      await poolRegisteryWorker(newTxDetails, synced);
    }
  } catch (error) {
    console.error("worker.error", error);
  }
};
