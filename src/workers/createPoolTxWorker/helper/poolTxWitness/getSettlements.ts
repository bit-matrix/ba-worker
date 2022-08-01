import { esploraClient } from "@bitmatrix/esplora-api-client";

const getSettlement = async (ctxid: string): Promise<string[]> => {
  const txHex = await esploraClient.txHex(ctxid);
  const tx = txHex.substring(0, 8) + "00" + txHex.substring(10);

  const part = 160;
  const p1 = tx.substring(0, part);
  const p2 = tx.substring(part, part * 2);
  const p3 = tx.substring(part * 2, part * 3);
  const p4 = tx.substring(part * 3, part * 4);
  const p5 = tx.substring(part * 4, part * 5);
  const p6 = tx.substring(part * 5, part * 5 + 36);

  return [p1, p2, p3, p4, p5, p6];
};

export const getSettlements = async (ctxid: string): Promise<string> => {
  const settlement = await getSettlement(ctxid);

  return (
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
    settlement[5]
  ); // 6TH_SETTLEMENT //
};
