import { Block, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmConfig, CallData, CallDataBase, CallDataValue, CommitmentOutput, Pool } from "@bitmatrix/models";
import { checkTweakedPubkey } from "./steps/checkTweakedPubkey";
import { getCallDataBase } from "./steps/getCallDataBase";
import { getCallDataValue } from "./steps/getCallDataValue";

export const isCtxWorker = async (pool: Pool, poolConfig: BmConfig, newTxDetail: TxDetail): Promise<{ callData: CallData; output: CommitmentOutput } | undefined> => {
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
        return { callData, output };
      }

      return;
    }

    return;
  }

  return;
};
