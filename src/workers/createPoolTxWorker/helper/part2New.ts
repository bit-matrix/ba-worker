import { BmConfig, CallData, Pool } from "@bitmatrix/models";
import { poolTxOutputs } from "./poolTxOutputs/poolTxOutputs";

export const part2New = (pool: Pool, poolConfig: BmConfig, callDatas: CallData[]): string => {
  return poolTxOutputs(pool, poolConfig, callDatas);
};
