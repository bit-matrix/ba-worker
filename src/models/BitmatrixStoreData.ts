import { CTXFinderResult, PTXFinderResult } from "@bitmatrix/models";

export type BitmatrixStoreData = {
  commitmentData: CTXFinderResult;
  poolTxId?: string;
};
