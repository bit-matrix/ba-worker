export type BmBlockInfo = {
  block_hash: string;
  block_height: number;
};

export type BmTxInfo = BmBlockInfo & {
  txid: string;
};
