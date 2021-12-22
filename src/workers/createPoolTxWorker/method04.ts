import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";

export const method04 = async (pool: Pool, poolConfig: BmConfig, bestCtx: BmCtxNew): Promise<string> => {
  console.log("Pool tx creating on method 04 for ctx new id: " + bestCtx.commitmentTx.txid);

  return "";
};
