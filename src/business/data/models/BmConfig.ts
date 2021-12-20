export type PAsset = { ticker: string; name: string; asset: string; value: string };

export type BmValue = {
  number: string;
  hex: string;
};
export type BmConfig = {
  id: string;
  minRemainingSupply: string;
  minTokenValue: string;
  baseFee: BmValue;
  serviceFee: BmValue;
  commitmentTxFee: BmValue;
  defaultOrderingFee: BmValue;
  fundingOutputAddress: string;
  innerPublicKey: string;
};
