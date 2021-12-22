import { hexLE } from "@script-wiz/wiz-data";

// tx inputs
export const part1 = (unspentTxid: string, commitmentTxid: string): string => {
  const latestPoolTxidLE = hexLE(unspentTxid);
  const ctxidLE = hexLE(commitmentTxid);

  const p1 =
    "02000000" +
    "01" +
    "06" +
    latestPoolTxidLE +
    "00000000" +
    "00" +
    "01000000" +
    latestPoolTxidLE +
    "01000000" +
    "00" +
    "01000000" +
    latestPoolTxidLE +
    "02000000" +
    "00" +
    "01000000" +
    latestPoolTxidLE +
    "03000000" +
    "00" +
    "01000000" +
    ctxidLE +
    "01000000" +
    "00" +
    "01000000" +
    ctxidLE +
    "02000000" +
    "00" +
    "01000000";

  return p1;
};
