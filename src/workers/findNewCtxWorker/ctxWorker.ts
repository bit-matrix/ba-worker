import { Block, TxDetail, TxOutSpend, esploraClient } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, BmPtx, BmTxInfo, CallData, CallDataBase, CallDataValue, CommitmentOutput, Pool } from "@bitmatrix/models";
import { ptxSave } from "../../business/db-client";
import { checkTweakedPubkey } from "./steps/checkTweakedPubkey";
import { getCallDataBase } from "./steps/getCallDataBase";
import { getCallDataValue } from "./steps/getCallDataValue";

const isCtxSpend = async (ctx: BmCtxNew): Promise<boolean> => {
  const txOutSpends = await esploraClient.txOutspends(ctx.commitmentTx.txid);
  const outSpend = txOutSpends[1];
  if (outSpend.spent && outSpend.status) {
    const poolTx: BmTxInfo = {
      txid: ctx.commitmentTx.txid,
      block_hash: outSpend.status.block_hash,
      block_height: outSpend.status?.block_height,
    };
    const value: BmPtx = { ...ctx, poolTx };

    ptxSave(ctx.commitmentTx.txid, value);

    return false;
  } else {
    return true;
  }
};

export const isCtxWorker = async (pool: Pool, poolConfig: BmConfig, newTxDetail: TxDetail, newBlock: Block): Promise<BmCtxNew | undefined> => {
  // console.log("New ctx worker for tx started for pool: " + pool.id + ". newBlockheight: " + newBmBlockInfo.block_height + ", txid: " + newTxDetails.txid);
  console.log("Is ctx worker started");

  const callDataBase: CallDataBase | undefined = getCallDataBase(pool.id, newTxDetail);
  if (callDataBase) {
    // const poolConfig: BmConfig = await config(pool.id);
    const callDataValue: CallDataValue | undefined = getCallDataValue(pool, poolConfig, callDataBase, newTxDetail);

    if (callDataValue) {
      const callData: CallData = { ...callDataBase, value: { ...callDataValue } };

      const output: CommitmentOutput | undefined = checkTweakedPubkey(pool.id, poolConfig.innerPublicKey, callData.recipientPublicKey, newTxDetail.vout[1].scriptpubkey);
      if (output) {
        // we found commitment transaction
        const ctx: BmCtxNew = {
          callData,
          output,
          commitmentTx: {
            txid: newTxDetail.txid,
            block_height: newBlock.height,
            block_hash: newBlock.id,
          },
        };
        return ctx;
      }

      return;
    }

    return;
  }

  return;
};

export const isNewCtxWorker = async (pool: Pool, poolConfig: BmConfig, newTxDetail: TxDetail, newBlock: Block): Promise<BmCtxNew | undefined> => {
  const ctx = await isCtxWorker(pool, poolConfig, newTxDetail, newBlock);
  if (ctx) {
    const isSpendCtx = await isCtxSpend(ctx);
    if (isSpendCtx) {
      return;
    } else {
      return ctx;
    }
  }
  return;
};
