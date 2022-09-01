import { PAsset } from "@bitmatrix/models";
import { LBTC_ASSET } from "../env";

export const tokenPriceCalculation = (token: PAsset, quote: PAsset): number => {
  if (quote.assetHash === LBTC_ASSET) {
    return Number(token.value) / Number(quote.value);
  }
  return Number(quote.value) / Number(token.value);
};
