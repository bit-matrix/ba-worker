import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmPtx, BmPtxCtx, Pool, PoolValues } from "@bitmatrix/models";
import { ctxMempool, ptxCtx, ptxSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

export const findNewPtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  console.log("Find new ptx worker started");

  // TODO
  // foreach
  const newTxDetail = newTxDetails[0];

  if (newTxDetail.vout[0].asset !== pool.id) return;

  console.log("Found pool tx!", newTxDetail.txid);
  sendTelegramMessage("Pool: " + pool.id + "\n" + "New ptx: https://blockstream.info/liquidtestnet/tx/" + newTxDetail.txid);

  let poolValues: PoolValues = {
    quote: newTxDetail.vout[3].value?.toString() || pool.quote.value,
    token: newTxDetail.vout[1].value?.toString() || pool.token.value,
    lp: newTxDetail.vout[2].value?.toString() || pool.lp.value,
    unspentTx: {
      txid: newTxDetail.txid,
      block_hash: newBlock.id,
      block_height: newBlock.height,
    },
  };
  sendTelegramMessage(
    "Pool: " + pool.id + "\n" + "New pool values: " + pool.quote.ticker + " = " + poolValues.quote + ", " + pool.token.ticker + " = " + poolValues.token + ", LP = " + poolValues.lp
  );

  const bmPtxCtx: BmPtxCtx = await ptxCtx(pool.id, newTxDetail.txid);
  // console.log("bmPtxCtx: ", pool.id, newTxDetail.txid);
  console.log("bmPtxCtx: ", bmPtxCtx);

  if (bmPtxCtx) {
    for (let i = 0; i < bmPtxCtx.commitmentTxs.length; i++) {
      const ctxid = bmPtxCtx.commitmentTxs[i];
      const ctxMem = await ctxMempool(pool.id, ctxid);

      if (ctxMem) {
        try {
          const bmPtx: BmPtx = {
            callData: ctxMem.callData,
            output: ctxMem.output,
            commitmentTx: ctxMem.commitmentTx,
            poolTx: { txid: newTxDetail.txid, block_hash: newBlock.id, block_height: newBlock.height },
          };

          await ptxSave(pool.id, bmPtx);
          sendTelegramMessage("Pool: " + pool.id + "\n" + "ctx spent: https://blockstream.info/liquidtestnet/tx/" + bmPtx.commitmentTx.txid);
        } catch (error) {
          console.error("ptxSave.error: Ptx: " + newTxDetail.txid + " Ctx: " + ctxid + ". ctxMem: " + ctxMem);
          throw error;
        }
      } else {
        console.warn("Ptx found, ptx-ctxs found but ctxMempool not found!. Ptx: " + newTxDetail.txid + " Ctx: " + ctxid);
      }
    }
  } else {
    console.warn("Ptx found but ptx-ctxs not found!. Ptx: " + newTxDetail.txid);
  }

  return poolValues;

  // If I didn't create a pool tx, I don't interest with it !!!
  // const mempoolCtxs: BmCtxMempool[] = await ctxsMempool(pool.id);
  // console.log("mempool ctxs: ", mempoolCtxs.length);
  // if (mempoolCtxs.length === 0) return;

  /* ctxs.forEach(async (ctx) => {
    await spentWorkerForCtx(pool, newBlockheight, ctx);
  }); */
};
