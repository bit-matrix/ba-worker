import { unspentPoolTxInputs } from "./unspentPoolTxInputs";
import { unspentCtxsPoolTxInputs } from "./ctxPoolTxInputs";

export const poolTxInputs = (unspentPtxid: string, unspentCtxids: string[]): string => {
  const poolTxInputsLength =
    4 + // unspent pool tx outputs total length
    2 * unspentCtxids.length; // unspent ctx outputs total length
  const poolTxInputsLengthHex = poolTxInputsLength.toString(16).padStart(2, "0");

  const unspentPoolTxInputsEncoded = unspentPoolTxInputs(unspentPtxid);

  const unspentCtxsPoolTxInputsEncoded = unspentCtxsPoolTxInputs(unspentCtxids);

  const poolTxInputsEncoded = "02000000" + "01" + poolTxInputsLengthHex + unspentPoolTxInputsEncoded + unspentCtxsPoolTxInputsEncoded;

  return poolTxInputsEncoded;
};
