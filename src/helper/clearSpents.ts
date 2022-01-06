import { esploraClient, TxOutSpend } from "@bitmatrix/esplora-api-client";
import { ctxSpentClear } from "../business/db-client";
import { BmCtxNew, Pool } from "@bitmatrix/models";

export const clearCtxSpents = async (pool: Pool, ctxs: BmCtxNew[]): Promise<BmCtxNew[]> => {
  const newCtxs = [...ctxs];

  for (let i = 0; i < newCtxs.length; i++) {
    const ctx = newCtxs[i];
    const txOutSpends: TxOutSpend[] = await esploraClient.txOutspends(ctx.commitmentTx.txid);
    const outSpend: TxOutSpend = txOutSpends[1];

    if (outSpend.spent) {
      await ctxSpentClear(pool.id, ctx.commitmentTx.txid);
      newCtxs.splice(i, 1);
    }
  }

  return newCtxs;
};
