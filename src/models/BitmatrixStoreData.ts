import { CTXFinderResult, PTXFinderResult } from "@bitmatrix/models";

export type BitmatrixStoreData = {
  commitmentData: CTXFinderResult;
  poolValidationData?: PTXFinderResult;
  poolTxId?: string;
};
