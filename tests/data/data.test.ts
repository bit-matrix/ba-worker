import { Pool } from "../../src/business/data/models/Pool";
import { pools, config, ctxsNew, ctxNewSave, ctxsMempool, ctxNew, ctxMempoolSave, ctxMempool, ptxs, ptxSave, ptx } from "../../src/business/data";
import { BmConfig } from "../../src/business/data/models/BmConfig";
import { BmCtxMempool, BmCtxNew, BmPtx, CallData, CALL_METHOD } from "../../src/business/data/models/BmTx";
import { clear } from "console";

const POOLS: Pool[] = [
  {
    id: "43a2f4ef8ce286e57ab3e39e6da3741382ba542854a1b28231a7a5b8ba337fcd",
    quote: {
      ticker: "tL-BTC",
      name: "Liquid Testnet Bitcoin",
      asset: "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49",
      value: "1005000",
    },
    token: {
      ticker: "tL-USDt",
      name: "Liquid Testnet Tether",
      asset: "213cbc4df83abc230852526b1156877f60324da869f0affaee73b6a6a32ad025",
      value: "49753000000",
    },
    lp: {
      ticker: "tL-BTC:tL-USDt:0",
      name: "Liquid Testnet LP: Bitcoin:Tether:0 Liquidty Provider",
      asset: "01f4346a807134c6dbe20801864d995b9b4c9a73063b0cd806596cd780c0af39",
      value: "1999990000",
    },
    createdTx: {
      txid: "3d9bc4c1b203536406c129a24c3a14475d781972e4edd861eaad279358637954",
      block_hash: "721d3a1c587ad367bc8982ba9cb0e36c4136efdd1f240f286c9bc19504f3cb69",
      block_height: 131275,
    },
    unspentTx: {
      txid: "3d9bc4c1b203536406c129a24c3a14475d781972e4edd861eaad279358637954",
      block_hash: "721d3a1c587ad367bc8982ba9cb0e36c4136efdd1f240f286c9bc19504f3cb69",
      block_height: 131275,
    },
    synced: false,
    syncedBlock: { block_hash: "721d3a1c587ad367bc8982ba9cb0e36c4136efdd1f240f286c9bc19504f3cb69", block_height: 131275 },
    recentBlock: { block_hash: "721d3a1c587ad367bc8982ba9cb0e36c4136efdd1f240f286c9bc19504f3cb69", block_height: 131275 },
    active: true,
  },
];

const BM_CONFIG: BmConfig = {
  id: "",
  minRemainingSupply: "1000",
  minTokenValue: "50000000",
  baseFee: { number: "650", hex: "" },
  serviceFee: { number: "1200", hex: "" },
  commitmentTxFee: { number: "100", hex: "0000000000000064" },
  defaultOrderingFee: { number: "1", hex: "01000000" },
  fundingOutputAddress: "tex1qft5p2uhsdcdc3l2ua4ap5qqfg4pjaqlp250x7us7a8qqhrxrxfsqh7creg",
  innerPublicKey: "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624",
};

const CALL_DATA: CallData = {
  method: CALL_METHOD.ADD_LIQUIDITY,
  orderingFee: 1,
  slippageTolerance: "",
  recipientPublicKey: "1234567890123456789012345678901234567890123456789012345678901234",
  value: { quote: 20, token: 30, lp: 40 },
};

const CTX_NEW: BmCtxNew = {
  callData: CALL_DATA,
  commitmentTx: {
    txid: "55d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
    block_height: 1,
    block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
};

const CTX_MEMPOOL: BmCtxMempool = {
  callData: CALL_DATA,
  commitmentTx: {
    txid: "66d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
    block_height: 1,
    block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
  poolTxid: "2254d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d",
};

const PTX: BmPtx = {
  callData: CALL_DATA,
  commitmentTx: {
    txid: "54d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
    block_height: 1,
    block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
  poolTx: {
    txid: "2254d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d",
    block_height: 2,
    block_hash: "88fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
};

let ps: Pool[] = [];

jest.setTimeout(30000);

test("clear test", async () => {
  try {
    await clear();
  } catch (er) {
    console.error(er);
  }
});

test("pools test", async () => {
  try {
    ps = await pools();

    expect(ps.length).toEqual(1);

    ps.forEach((p, i) => {
      expect(p).toEqual(POOLS[i]);
    });
  } catch (er) {
    console.error(er);
  }
});

test("config test", async () => {
  try {
    ps.forEach(async (p) => {
      const c = await config(p.id);
      expect(c).toEqual({ ...BM_CONFIG, id: p.id });
    });
  } catch (er) {
    console.error(er);
  }
});

test("new ctxs test", async () => {
  try {
    ps.forEach(async (p) => {
      const ctxs = await ctxsNew(p.id);

      expect(ctxs.length).toBeGreaterThan(-1);
    });
  } catch (er) {
    console.error(er);
  }
});

test("mempool ctxs test", async () => {
  try {
    ps.forEach(async (p) => {
      const ctxs = await ctxsMempool(p.id);

      expect(ctxs.length).toBeGreaterThan(-1);
    });
  } catch (er) {
    console.error(er);
  }
});

test("ptxs test", async () => {
  try {
    ps.forEach(async (p) => {
      const ctxs = await ptxs(p.id);

      expect(ctxs.length).toBeGreaterThan(-1);
    });
  } catch (er) {
    console.error(er);
  }
});

test("new ctx add test", async () => {
  try {
    const poolId = POOLS[0].id;

    await ctxNewSave(poolId, CTX_NEW);

    const ctxs = await ctxsNew(poolId);
    expect(ctxs.length).toEqual(1);
    expect(ctxs[0]).toEqual(CTX_NEW);

    const ctx = await ctxNew(poolId, CTX_NEW.commitmentTx.txid);
    expect(ctx).toEqual(CTX_NEW);
  } catch (er) {
    console.error(er);
  }
});

test("ctx mempool add test", async () => {
  try {
    const poolId = POOLS[0].id;

    await ctxMempoolSave(poolId, CTX_MEMPOOL);

    const ctxs = await ctxsNew(poolId);
    expect(ctxs.length).toEqual(1);
    expect(ctxs[0]).toEqual(CTX_NEW);

    const ctxsMems = await ctxsMempool(poolId);
    expect(ctxsMems.length).toEqual(1);
    expect(ctxsMems[0]).toEqual(ctxsMems);

    const ctxM = await ctxMempool(poolId, CTX_MEMPOOL.commitmentTx.txid);
    expect(ctxM).toEqual(CTX_MEMPOOL);
  } catch (er) {
    console.error(er);
  }
});

test("ptx add test", async () => {
  try {
    const poolId = POOLS[0].id;

    await ptxSave(poolId, PTX);

    const ps = await ptxs(poolId);
    expect(ps.length).toEqual(1);
    expect(ps[0]).toEqual(PTX);

    const p = await ptx(poolId, ps[0].commitmentTx.txid);
    expect(p).toEqual(PTX);
  } catch (er) {
    console.error(er);
  }
});
