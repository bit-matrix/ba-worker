import { PAsset, Pool } from "@bitmatrix/models";
import { lbtcAsset } from "./util";

export const tokenPriceCalculation = (token: PAsset, quote: PAsset): number => {
  if (quote.value && quote.value) {
    if (quote.assetHash === lbtcAsset) {
      return Number(token.value) / Number(quote.value);
    }

    return ((Number(quote.value) * Math.pow(10, 8 - quote.precision)) / Number(token.value)) * Math.pow(10, 8 - token.precision);
  }

  return 0;
};
