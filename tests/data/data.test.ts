import { pools, config, ctxsNew, ctxNewSave, ctxsMempool, ctxNew, ctxMempoolSave, ctxMempool, ptxs, ptxSave, ptx, clear } from "../../src/business/db-client";
import { BmBlockInfo, BmConfig, BmCtxMempool, BmCtxNew, BmPtx, BmTxInfo, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";

const initialPoolBlock: BmBlockInfo = {
  block_hash: "5ba3c5c59e514db9ce7be1a2fcc2c99693cdc6fe1d649c1d6e261bbe5b9815f6",
  block_height: 138366,
};

const initialPoolTx: BmTxInfo = {
  txid: "c2fe3190fad754e57703344ff6d73c40ddafcc2c4fbddcd659b9ba7e4db25b37",
  ...initialPoolBlock,
};

const POOLS: Pool[] = [
  {
    /**
     * pool assets, values
     */
    id: "e1ed34f4be34f90408f008c32f932e2b7ebfbfab64ed3e925aab8b635cba5c16",
    quote: {
      ticker: "tL-BTC",
      name: "Liquid Testnet Bitcoin",
      asset: "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49",
      value: "1000000000",
    },
    token: {
      ticker: "tL-USDt",
      name: "Liquid Testnet Tether",
      asset: "58caa32446839c6befe7bcf483c72d27a92c45429b55ff6f42b3c0a9726aa19e",
      value: "50000000000000",
    },
    lp: {
      ticker: "tL-BTC:tL-USDt:0",
      name: "Liquid Testnet LP: Bitcoin:Tether:0 Liquidty Provider",
      asset: "772c8f2d8a5426cdc2a483f75b3fc317b67c599f8c8741b90539db48bf47a0f4",
      value: "1999990000",
    },

    /**
     * pool creation tx info
     */
    initialTx: initialPoolTx,

    /**
     * last worker checked block info
     */
    lastSyncedBlock: initialPoolBlock,

    /**
     * recent block height on network
     */
    bestBlockHeight: 0,

    /**
     * lastSyncedBlock.height === bestBlockHeight
     * (if true worker can create pool tx else pass creation pool tx)
     */
    synced: false,

    /**
     * recent worker found pool tx (it may be spent, validate "synced")
     */
    lastUnspentTx: initialPoolTx,

    /**
     * if worker broadcast one tx, save here.
     * when it confirmed (worker found new ptx is equal to this), delete for new creation pool tx
     */
    lastSentPtx: undefined,

    /**
     * pool is active
     */
    active: true,
  },
];

const BM_CONFIG: BmConfig = {
  id: "",
  minRemainingSupply: 1000,
  minTokenValue: 50000000,
  baseFee: { number: 650, hex: "" },
  serviceFee: { number: 1200, hex: "" },
  commitmentTxFee: { number: 100, hex: "0000000000000064" },
  defaultOrderingFee: { number: 1, hex: "01000000" },
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
  output: { compiledData: "", tweakPrefix: "c4" },
  commitmentTx: {
    txid: "55d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
    block_height: 1,
    block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
};

const CTX_MEMPOOL: BmCtxMempool = {
  callData: CALL_DATA,
  output: { compiledData: "", tweakPrefix: "c4" },
  commitmentTx: {
    txid: "66d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d19",
    block_height: 1,
    block_hash: "f1fedb4e9f09f0e30181432379aa33b60fa044165f951be58614e614b9f884ca",
  },
  poolTxid: "2254d8c6e3802f06ead43b04fe7fdcd07e17344e6b32512de833bb659a59004d",
};

const PTX: BmPtx = {
  callData: CALL_DATA,
  output: { compiledData: "", tweakPrefix: "c4" },
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
