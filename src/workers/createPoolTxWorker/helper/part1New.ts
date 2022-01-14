import { poolTxInputs } from "./poolTxInputs/poolTxInputs";

export const part1New = (unspentTxid: string, commitmentTxids: string[]): string => {
  return poolTxInputs(unspentTxid, commitmentTxids);
};
