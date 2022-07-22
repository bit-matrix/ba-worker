import { CTXFinderResult, TxDetail } from "@bitmatrix/models";

export type RedisData = {
  transaction: TxDetail;
  commitmentData: CTXFinderResult;
};
