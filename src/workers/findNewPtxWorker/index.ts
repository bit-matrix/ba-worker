import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmPtx, BmPtxCtx, Pool, PoolValues } from "@bitmatrix/models";
import { ctxMempool, ptxCtx, ptxSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

export const isPtxWorker = (pool: Pool, newBlock: Block, newTxDetail: TxDetail): PoolValues | undefined => {
  // console.log("Is ptx worker started");

  if (newTxDetail.vout[0].asset !== pool.id) return;

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

  return poolValues;
};

export const findNewPtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  console.log("Find new ptx worker started");

  let poolValues: PoolValues | undefined = undefined;
  for (let i = 0; i < newTxDetails.length; i++) {
    if (poolValues === undefined) {
      const ntx = newTxDetails[i];
      poolValues = isPtxWorker(pool, newBlock, ntx);
    } else {
      break;
    }
  }

  if (poolValues === undefined) return;

  // console.log("Found pool tx!", poolValues.unspentTx.txid);
  sendTelegramMessage(
    "Pool Tx: <code>" +
      poolValues.unspentTx.txid +
      "</code>\n" +
      "Pool Values: <b>" +
      pool.quote.ticker +
      "</b>:<code>" +
      poolValues.quote +
      "</code>, <b>" +
      pool.token.ticker +
      "</b>:<code>" +
      poolValues.token +
      "</code>, <b>LP</b>:<code>" +
      poolValues.lp +
      "</code>"
  );

  const bmPtxCtx: BmPtxCtx = await ptxCtx(pool.id, poolValues.unspentTx.txid);
  // console.log("bmPtxCtx: ", pool.id, newTxDetail.txid);
  // console.log("bmPtxCtx: ", bmPtxCtx);

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
            poolTx: { txid: poolValues.unspentTx.txid, block_hash: newBlock.id, block_height: newBlock.height },
          };

          await ptxSave(pool.id, bmPtx);
          sendTelegramMessage("Swap completed.\nCommitment txid: <code>" + bmPtx.commitmentTx.txid + "</code>\nPool txid: <code>" + poolValues.unspentTx.txid + "</code>");
        } catch (error) {
          console.error("ptxSave.error: Ptx: " + poolValues.unspentTx.txid + " Ctx: " + ctxid + ". ctxMem: " + ctxMem);
          throw error;
        }
      } else {
        console.warn("Ptx found, ptx-ctxs found but ctxMempool not found!. Ptx: " + poolValues.unspentTx.txid + " Ctx: " + ctxid);
      }
    }
  } else {
    console.warn("Ptx found but ptx-ctxs not found!. Ptx: " + poolValues.unspentTx.txid);
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
