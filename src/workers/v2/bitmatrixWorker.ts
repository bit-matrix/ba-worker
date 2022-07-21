import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { pools } from "../../business/db-client";
import { commitmentWorker } from "./commitmentWorker";
import { poolRegisteryWorker } from "./poolRegisteryWorker";
import { poolTxWorker } from "./poolTxWorker";

export const bitmatrixWorker = async (newBlockHash: string) => {
  try {
    console.log("bitmatrix worker started..");

    let newTxDetails: TxDetail[] = [];

    newTxDetails = await esploraClient.blockTxs(newBlockHash);

    newTxDetails = newTxDetails.slice(1); // for coinbase transaction

    if (newTxDetails.length > 0) {
      console.log("welcome to new tx ..");

      // nft avcısı worker -> pool'u update edecek
      // isCTXSpentWorker -> redisi update eder / silecek

      const ps = await pools();

      await commitmentWorker(ps, newTxDetails);

      await poolTxWorker(ps, newTxDetails);

      await poolRegisteryWorker(newTxDetails);
    }
  } catch (error) {
    console.error("worker.error", error);
  }
};
