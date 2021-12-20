import { BmBlockInfo, BmTxInfo } from "./BmInfo";

export type PAsset = { ticker: string; name: string; asset: string; value: string };

export type Pool = {
  id: string;
  quote: PAsset;
  token: PAsset;
  lp: PAsset;
  createdTx: BmTxInfo;
  unspentTx: BmTxInfo;
  synced: boolean;
  syncedBlock: BmBlockInfo;
  recentBlock: BmBlockInfo;
  active: boolean;
};
