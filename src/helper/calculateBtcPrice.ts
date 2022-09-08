import { Pool } from "@bitmatrix/models";
import { lbtcAsset, usdtAsset } from "./util";

export const calculateBtcPrice = (pools: Pool[]) => {
  if (pools.length > 0) {
    const filteredPools = pools.filter((pl) => {
      return pl.token.assetHash === lbtcAsset && pl.quote.assetHash === usdtAsset;
    });

    if (filteredPools.length > 0) {
      const tvlSort = filteredPools.sort((a, b) => Number(b.quote.value) - Number(a.quote.value));
      const bestPool = tvlSort[0];

      const price = Math.floor(Number(bestPool.quote.value) / Number(bestPool.token.value));

      return price;
    }

    return 0;
  }

  return 0;
};
