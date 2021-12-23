import { Block, esploraClient, TxDetail, TxOutSpend } from "@bitmatrix/esplora-api-client";
import { BmPtx, BmPtxCtx, BmTxInfo, Pool, PoolValues } from "@bitmatrix/models";
import { ctxMempool, ptxCtx, ptxSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

const unspentPtx = async (newBlock: Block, newTxDetail: TxDetail): Promise<BmTxInfo | undefined> => {
  const txOutSpends: TxOutSpend[] = await esploraClient.txOutspends(newTxDetail.txid);
  const outSpend: TxOutSpend = txOutSpends[1];
  if (outSpend.spent && outSpend.status) {
    return;
  }
  const unspentTx: BmTxInfo = {
    txid: newTxDetail.txid,
    block_hash: newBlock.id,
    block_height: newBlock.height,
  };
  return unspentTx;
};

export const isPtxWorker = async (pool: Pool, newBlock: Block, newTxDetail: TxDetail): Promise<PoolValues | undefined> => {
  // console.log("Is ptx worker started");

  if (newTxDetail.vout[0].asset !== pool.id) return;
  // We found pool transaction
  const unspentTx = await unspentPtx(newBlock, newTxDetail);

  let poolValues: PoolValues = {
    quote: newTxDetail.vout[3].value?.toString() || pool.quote.value,
    token: newTxDetail.vout[1].value?.toString() || pool.token.value,
    lp: newTxDetail.vout[2].value?.toString() || pool.lp.value,
    unspentTx,
  };

  // console.log("Found pool tx!", poolValues.unspentTx.txid);
  sendTelegramMessage(
    "Pool Tx: <code>" +
      poolValues.unspentTx?.txid +
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

  const bmPtxCtx: BmPtxCtx = await ptxCtx(pool.id, newTxDetail.txid);
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
            poolTx: { txid: newTxDetail.txid, block_hash: newBlock.id, block_height: newBlock.height },
          };

          await ptxSave(pool.id, bmPtx);
          sendTelegramMessage("Swap completed.\nCommitment txid: <code>" + bmPtx.commitmentTx.txid + "</code>\nPool txid: <code>" + newTxDetail.txid + "</code>");
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
};
