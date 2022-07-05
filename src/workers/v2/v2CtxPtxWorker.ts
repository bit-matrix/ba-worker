import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { pools } from "../../business/db-client";
import { commitmentWorker } from "./commitmentWorker";

export const v2CtxPtxWorker = async (newBlockHash: string) => {
  try {
    console.log("pool tx , commitment tx worker started..");

    let newTxDetails: TxDetail[] = [];

    newTxDetails = await esploraClient.blockTxs(newBlockHash);

    newTxDetails = newTxDetails.slice(1); // for coinbase transaction

    if (newTxDetails.length > 0) {
      const ps = await pools();

      return commitmentWorker(ps, newTxDetails);
    }

    // await commitmentFinder(pool, newTxDetails);

    // for (let i = 0; i < ps.length; i++) {
    //   const p = ps[i];
    //   if (p.active) {
    //     const poolWorkerPromise = poolWorker(p, newBlock);
    //     promises.push(poolWorkerPromise);
    //   }
    // }
  } catch (error) {
    console.error("worker.error", error);
  }
};
