import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BmCtxNew } from "@bitmatrix/models";

const splitCommitmentTxBaseHex = async (txHex: string) => {
  const tx = txHex.substring(0, 8) + "00" + txHex.substring(10);

  const part = 160;
  const p1 = tx.substring(0, part);
  const p2 = tx.substring(part, part * 2);
  const p3 = tx.substring(part * 2, part * 3);
  const p4 = tx.substring(part * 3, part * 4);
  const p5 = tx.substring(part * 4, part * 5);
  const p6 = tx.substring(part * 5, part * 5 + 36);
  console.log("p6", p6.length);
  const settlement = [p1, p2, p3, p4, p5, p6];
  return settlement;
};

const settlementCtx = async (ctx: BmCtxNew): Promise<string[]> => {
  const txHex = await esploraClient.txHex(ctx.commitmentTx.txid);
  const settlement = await splitCommitmentTxBaseHex(txHex);
  return settlement;
};

const settlementCtxs = async (ctxs: BmCtxNew[]): Promise<string[][]> => {
  const settlementsArray: string[][] = [];

  for (let i = 0; i < ctxs.length; i++) {
    const ctx = ctxs[i];
    const settlementEncoded = await settlementCtx(ctx);
    settlementsArray.push(settlementEncoded);
  }
  return settlementsArray;
};

export const settlements = async (ctxs: BmCtxNew[]) => {
  const settlementsEncoded = await settlementCtxs(ctxs);
  const settlementsEncodedReversed = settlementsEncoded.reverse();
  return settlementsEncodedReversed.join("");
};
