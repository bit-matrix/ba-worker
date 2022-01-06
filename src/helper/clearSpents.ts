import { esploraClient, TxOutSpend } from "@bitmatrix/esplora-api-client";
import { ctxNewDelete } from "../business/db-client";
import { BmCtxNew, Pool } from "@bitmatrix/models";

export const clearCtxSpents = async (pool: Pool, ctxs: BmCtxNew[]): Promise<BmCtxNew[]> => {
  let newCtxs = [...ctxs];

  for (let i = 0; i < ctxs.length; i++) {
    const ctx = ctxs[i];
    const txOutSpends: TxOutSpend[] = await esploraClient.txOutspends(ctx.commitmentTx.txid);
    const outSpend: TxOutSpend = txOutSpends[1];

    if (outSpend.spent) {
      await ctxNewDelete(pool.id, ctx.commitmentTx.txid);
      newCtxs.splice(i, 1);
    }
  }

  return newCtxs;
};
