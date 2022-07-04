import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, Pool } from "@bitmatrix/models";

export const commitmentWorker = async (pool: Pool, newTxDetails: TxDetail[]) => {
  try {
    for (let i = 0; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
    }
  } catch (error) {
    console.error("commitmentWorker.error", error);
  }
};
