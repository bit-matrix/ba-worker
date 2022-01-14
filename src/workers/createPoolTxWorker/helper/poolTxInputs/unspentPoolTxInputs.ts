import { hexLE } from "@script-wiz/wiz-data";

// unspent (latest) pool tx ids outputs
export const unspentPoolTxInputs = (unspentTxid: string): string => {
  const unspentPoolTxidLE = hexLE(unspentTxid);

  const unspentPoolTxInputsEncoded =
    unspentPoolTxidLE +
    "00000000" + // flag asset id txout index
    "00" +
    "01000000" +
    unspentPoolTxidLE +
    "01000000" + // token txout index
    "00" +
    "01000000" +
    unspentPoolTxidLE +
    "02000000" + // lp txout index
    "00" +
    "01000000" +
    unspentPoolTxidLE +
    "03000000" + // quote txout index
    "00" +
    "01000000";

  return unspentPoolTxInputsEncoded;
};
