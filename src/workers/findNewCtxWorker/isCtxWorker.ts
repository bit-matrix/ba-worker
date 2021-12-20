import { Pool } from "../../business/data/models/Pool";
import { TxDetail } from "@bitmatrix/esplora-api-client";
import { BmBlockInfo } from "../../business/data/models/BmInfo";

export const isCtxWorker = async (pool: Pool, newBmBlockInfo: BmBlockInfo, newTxDetails: TxDetail) => {
  // console.log("New ctx worker for tx started for pool: " + pool.id + ". newBlockheight: " + newBmBlockInfo.block_height + ", txid: " + newTxDetails.txid);
  console.log("Is ctx worker started");
};
