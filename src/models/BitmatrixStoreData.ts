import { CTXFinderResult, CTXPTXResult } from "@bitmatrix/models";

export type BitmatrixStoreData = {
  commitmentData: CTXFinderResult;
  poolValidationData?: CTXPTXResult;
  poolTxId?: string;
};
