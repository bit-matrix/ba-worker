import { hexLE } from "@script-wiz/wiz-data";

const unspentCtxPoolTxInputs = (unspentCommitmentTxid: string): string => {
  const unspentCommitmentTxidLE = hexLE(unspentCommitmentTxid);

  const unspentCtxPoolTxInputsEncoded: string =
    unspentCommitmentTxidLE +
    "01000000" + // ctx txout 1 index
    "00" +
    "01000000" +
    unspentCommitmentTxidLE +
    "02000000" + // ctx txout 2 index
    "00" +
    "01000000";

  return unspentCtxPoolTxInputsEncoded;
};

export const unspentCtxsPoolTxInputs = (unspentCommitmentTxids: string[]): string => {
  const unspentCtxsPoolTxInputsEncoded = unspentCommitmentTxids.reduce((previous, current) => previous + unspentCtxPoolTxInputs(current), "");

  return unspentCtxsPoolTxInputsEncoded;
};
