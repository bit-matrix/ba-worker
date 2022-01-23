import { hexLE } from "@script-wiz/wiz-data";

// new pool tx service commission output
export const serviceCommissionTxOutput = (qouteAsset: string, serviceCommissionValueHex: string): string => {
  const qouteAssetLE = hexLE(qouteAsset);

  const serviceCommissionTxOutputEncoded = "01" + qouteAssetLE + "01" + serviceCommissionValueHex + "00" + "16" + "0014972ca4efa6bac21a771259e77dafabeeb0acbfe0"; // ??

  return serviceCommissionTxOutputEncoded;
};
