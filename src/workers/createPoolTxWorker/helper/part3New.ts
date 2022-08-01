import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { poolTxWitness } from "./poolTxWitness/poolTxWitness";

// witness
export const part3New = async (pool: Pool, poolConfig: BmConfig, ctxs: BmCtxNew[]): Promise<string> => {
  return poolTxWitness(pool, poolConfig, ctxs);
};
