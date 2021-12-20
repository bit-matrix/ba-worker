import { BmTxInfo } from "./BmInfo";

export enum CALL_METHOD {
  SWAP_QUOTE_FOR_TOKEN = "01",
  SWAP_TOKEN_FOR_QUOTE = "02",
  ADD_LIQUIDITY = "03",
  REMOVE_LIQUIDITY = "04",
}

export type CallData = {
  method: CALL_METHOD;
  recipientPublicKey: string;
  slippageTolerance: string; // number; TODO
  orderingFee: number; // number; TODO
  value: {
    quote: number;
    token: number;
    lp: number;
  };
};

export type BmCtxNew = {
  callData: CallData;
  commitmentTx: BmTxInfo;
};

export type BmCtxMempool = BmCtxNew & {
  poolTxid: string;
};

export type BmPtxCtx = {
  poolTxid: string;
  commitmentTxs: string[];
};

export type BmPtx = BmCtxNew & {
  poolTx: BmTxInfo;
};
