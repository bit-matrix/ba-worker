import { PAsset } from "@bitmatrix/models";
import { lbtcAsset, usdtAsset } from "./util";

export const tokenPriceCalculation = (token: PAsset, quote: PAsset): number => {
  if (quote.assetHash === lbtcAsset) {
    return Number(token.value) / Number(quote.value);
  } else if (quote.assetHash === usdtAsset) {
    return Number(quote.value) / Number(token.value);
  }

  return 0;
};
