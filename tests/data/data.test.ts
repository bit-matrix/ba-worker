import { activeCtx, assetBlockheight, pools, saveCtx } from "../../src/business/data";
import { CALL_METHOD } from "../../src/business/data/models/CALL_METHOD";
import { CommitmentTx } from "../../src/business/data/models/CommitmentTx";
import { Pool } from "../../src/business/data/models/Pool";

let ps: Pool[] = [];

test("pools test", async () => {
  try {
    ps = await pools();

    expect(ps.length).toEqual(1);

    ps.forEach((p) => {
      expect(p.asset).toEqual("43a2f4ef8ce286e57ab3e39e6da3741382ba542854a1b28231a7a5b8ba337fcd");
      expect(p.active).toEqual(true);
      expect(p.quote.ticker).toEqual("L-BTC");
      expect(p.quote.name).toEqual("Liquid Bitcoin");
      expect(p.token.ticker).toEqual("USDt");
      expect(p.token.name).toEqual("Tether USD");
    });
  } catch (er) {
    console.error(er);
  }
});

test("assetBlockheight test", async () => {
  try {
    ps.forEach(async (p) => {
      const blockheights = await assetBlockheight(p.asset);

      expect(blockheights.ctx.block_height).toBeGreaterThan(-1);
      expect(blockheights.ctx.block_hash.length).toEqual(64);

      expect(blockheights.ptx.block_height).toBeGreaterThan(-1);
      expect(blockheights.ptx.block_hash.length).toEqual(64);
    });

    expect(ps.length).toEqual(1);
  } catch (er) {
    console.error(er);
  }
});

test("activeCtx test", async () => {
  try {
    ps.forEach(async (p) => {
      const ctxs = await activeCtx(p.asset);

      expect(ctxs.length).toBeGreaterThan(-1);
    });
  } catch (er) {
    console.error(er);
  }
});

const ctxData: CommitmentTx = {
  block_height: 1,
  block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  txs: [
    {
      txid: "54d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
      data: {
        CALL_METHOD: CALL_METHOD.SWAP_QUOTE_FOR_TOKEN,
        RECIPIENT_PUBLIC_KEY: "8941e83b2a9228f2052aafc8d8eae85ff1e8ef71c5d7924712d4cfdfaa16b9b1",
        SLIPPAGE_TOLERANCE: "01",
        ORDERING_FEE: 999,
        SATOSHI_VALUE: 567000,
        TOKEN_VALUE: 0,
        LP_VALUE: 0,
      },
      spendTxId: "",
    },
  ],
};

test("saveCtx test", async () => {
  try {
    ps.forEach(async (p) => {
      await saveCtx(p.asset, ctxData.block_hash, ctxData);

      const ctxs = await activeCtx(p.asset);

      expect(ctxs.length).toEqual(1);
      expect(ctxs[0]).toEqual(ctxData);
    });
  } catch (er) {
    console.error(er);
  }
});
