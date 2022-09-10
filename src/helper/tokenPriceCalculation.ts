import { PAsset, Pool } from "@bitmatrix/models";
import { lbtcAsset } from "./util";

export const tokenPriceCalculation = (token: PAsset, quote: PAsset): number => {
  if (quote.assetHash === lbtcAsset) {
    return Number(token.value) / Number(quote.value);
  }

  return Number(quote.value) / Number(token.value);
};
