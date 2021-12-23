import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CallData, CommitmentOutput, Pool } from "@bitmatrix/models";
import { config, ctxNewSave } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isNewCtxWorker } from "./ctxWorker";

export const findNewCtxWorker = async (pool: Pool, newBlock: Block, newTxDetails: TxDetail[]) => {
  try {
    // console.log("Find new ctx worker started for pool: " + pool.id + ", newBlockheight: " + newBmBlockInfo.block_height);
    // console.log("Find new ctx worker started");
    // console.log("Tx count: " + newTxDetails.length);

    const poolConfig: BmConfig = await config(pool.id);

    for (let i = 0; i < newTxDetails.length; i++) {
      const newTxDetail = newTxDetails[i];
      const callDataOutputs: { callData: CallData; output: CommitmentOutput } | undefined = await isNewCtxWorker(pool, poolConfig, newTxDetail, newBlock);
      if (callDataOutputs) {
        console.log("Found call data!", callDataOutputs);

        const bmCtxNew: BmCtxNew = { ...callDataOutputs, commitmentTx: { txid: newTxDetail.txid, block_height: newBlock.height, block_hash: newBlock.id } };
        await ctxNewSave(pool.id, bmCtxNew);
        sendTelegramMessage(
          "Pool: " +
            pool.id +
            "\n" +
            "New ctx: https://db.bitmatrix-aggregate.com/ctx/" +
            pool.id +
            "/" +
            bmCtxNew.commitmentTx.txid +
            " Method: " +
            callDataOutputs.callData.method +
            ", value: " +
            callDataOutputs.callData.value.quote +
            ", tweak_prefix: " +
            callDataOutputs.output.tweakPrefix
        );
      }
    }
  } catch (error) {
    console.error("findNewCtxWorker.error", error);
  }
};
