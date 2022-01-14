import { hexLE } from "@script-wiz/wiz-data";

// new pool tx tx fee output
export const poolTxTxFeeOutput = (qouteAsset: string, txFeeValueHex: string): string => {
  const qouteAssetLE = hexLE(qouteAsset);

  const poolTxTxFeeOutputEncoded = "01" + qouteAssetLE + "01" + txFeeValueHex;
  "00" + "00" + "00000000";

  return poolTxTxFeeOutputEncoded;
};
