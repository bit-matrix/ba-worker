import { esploraClient, UserIssuedAsset } from "@bitmatrix/esplora-api-client";

export const getAsset = async (assetId: string): Promise<UserIssuedAsset | undefined> => {
  const asset = esploraClient.asset(assetId) as any as UserIssuedAsset;
  if (asset.chain_stats === undefined) return undefined;
  return asset;
};
