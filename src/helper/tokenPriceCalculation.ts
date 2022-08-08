import { PAsset } from "@bitmatrix/models";

export const tokenPriceCalculation = (token: PAsset, quote: PAsset): number => {
  if (quote.ticker === "tL-BTC") {
    return Number(token.value) / Number(quote.value);
  } else if (quote.ticker === "tL-USDt") {
    return Number(quote.value) / Number(token.value);
  }

  return 0;
};
