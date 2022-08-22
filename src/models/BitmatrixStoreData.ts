import { poolTxInfo } from "@bitmatrix/models/PoolTxInfo";
import { CTXFinderResult } from "./CTXFinderResult";
export declare type BitmatrixStoreData = {
  commitmentData: CTXFinderResult;
  poolTxInfo?: poolTxInfo;
};
