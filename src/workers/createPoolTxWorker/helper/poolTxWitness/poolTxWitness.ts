import { BmCtxNew } from "@bitmatrix/models";
import { getSettlements } from "./getSettlements";

export const poolTxWitness = async (ctx: BmCtxNew): Promise<string> => {
  const settlements: string = await getSettlements(ctx.commitmentTx.txid);
  return "" + settlements + "";
};
