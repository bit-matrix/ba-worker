import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";

export const method03 = async (pool: Pool, poolConfig: BmConfig, bestCtx: BmCtxNew): Promise<string | undefined> => {
  console.log("Pool tx creating on method 03 for ctx new id: " + bestCtx.commitmentTx.txid);

  return;
};
