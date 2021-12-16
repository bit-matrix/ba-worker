import { CommitmentTxData } from "./CommitmentTxData";

export type CommitmentTx = {
  block_hash: string;
  block_height: number;
  txs: {
    txid: string;
    data: CommitmentTxData;
    spendTxId: string;
  }[];
};
