import { CommitmentTx } from "./CommitmentTx";

export type PoolTx = {
  block_hash: string;
  block_height: number;
  txs: {
    txid: string;
    commitmentTx: CommitmentTx;
  }[];
};
