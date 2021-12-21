import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";

export const method04 = (pool: Pool, poolConfig: BmConfig, bestCtx: BmCtxNew) => {
  console.log("Pool tx creating on method 04 for ctx new id: " + bestCtx.commitmentTx.txid);
};
