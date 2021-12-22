import { Block } from "@bitmatrix/esplora-api-client";
import { BmPtx } from "@bitmatrix/models";
import { ctxsMempool, ptxSave } from "../../business/db-client";

export const updateConfirmedCtxMempools = async (asset: string, ptxid: string, newBlock: Block): Promise<void> => {
  const ctxsm = await ctxsMempool(asset);
  if (ctxsm && ctxsm.length > 0) {
    for (let i = 0; i < ctxsm.length; i++) {
      const cm = ctxsm[i];
      const value: BmPtx = {
        callData: cm.callData,
        output: cm.output,
        commitmentTx: cm.commitmentTx,
        poolTx: { txid: ptxid, block_height: newBlock.height, block_hash: newBlock.id },
      };
      await ptxSave(asset, value);
    }
  }

  return;
};
