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

const settlementEncoded = (settlement: string[], tweakPrefix: string): string => {
  const tapscriptPrefixBase = tweakPrefix === "c4" ? "02" : "03";

  return (
    "01" + // tapscriptPrefixBase lenght
    tapscriptPrefixBase +
    // Commitment tx 1 base-serialization in 5 settlements
    "50" +
    settlement[0] + // 1ST_SETTLEMENT //
    "50" +
    settlement[1] + // 2ND_SETTLEMENT //
    "50" +
    settlement[2] + // 3RD_SETTLEMENT //
    "50" +
    settlement[3] + // 4TH_SETTLEMENT //
    "50" +
    settlement[4] + // 5TH_SETTLEMENT //
    "12" +
    settlement[5] // 6TH_SETTLEMENT //;
  );
};

export const settlements = async (ctxs: BmCtxNew[]) => {
  const settlementsArray = await settlementCtxs(ctxs);
  const resultsSorted: string[] = [];

  for (let i = 0; i < settlementsArray.length; i++) {
    const s = settlementsArray[i];
    const sencoded = settlementEncoded(s, ctxs[i].output.tweakPrefix);
    resultsSorted.push(sencoded);
  }

  const settlementsEncoded = resultsSorted.reverse().join("");
  return settlementsEncoded;
};
