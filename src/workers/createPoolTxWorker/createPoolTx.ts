import { BmConfig, BmCtxNew, BmNewPtxResult, CallData, Pool } from "@bitmatrix/models";

import { part1New } from "./helper/part1New";
import { part2New } from "./helper/part2New";
import { part3New } from "./helper/part3New";

import { sendRawTransaction } from "./helper/sendRawTransaction";

export const createPoolTx = async (pool: Pool, poolConfig: BmConfig, ctxs: BmCtxNew[]): Promise<BmNewPtxResult> => {
  try {
    if (pool.unspentTx === undefined) throw new Error("Unspent ptx yok!!! Nassi geldin buraya??");

    const result: BmNewPtxResult = { poolTx: undefined, ctxsResult: [] };

    const commitmentTxids: string[] = ctxs.map((c) => c.commitmentTx.txid);
    const callDatas: CallData[] = ctxs.map((c) => c.callData);

    const txInputsEncoded: string = part1New(pool.unspentTx.txid, commitmentTxids);
    console.log("txInputsEncoded: " + txInputsEncoded);

    const { txOutputsEncoded, isOutOfSlippages } = part2New(pool, poolConfig, callDatas);
    console.log("txOutputsEncoded: " + txOutputsEncoded);

    const txWitnessEncoded: string = await part3New(pool, poolConfig, ctxs);
    console.log("txWitnessEncoded: " + txWitnessEncoded);

    const txEncoded = txInputsEncoded + txOutputsEncoded + txWitnessEncoded;
    console.log("txEncoded: " + txEncoded);

    const poolTxid = await sendRawTransaction(txEncoded);

    if (poolTxid) {
      console.log("poolTxid", poolTxid);
      result.poolTx = poolTxid;
      result.ctxsResult = ctxs.map((c, i) => ({ bmCtxNew: c, isOutOfSlippage: isOutOfSlippages[i], error: undefined }));
    }

    return result;
  } catch (error) {
    throw new Error((error as any).message);
  }
};
