import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";

export const method01 = (pool: Pool, poolConfig: BmConfig, bestCtx: BmCtxNew) => {
  console.log("Pool tx creating on method 01 for ctx new id: " + bestCtx.commitmentTx.txid);
};
