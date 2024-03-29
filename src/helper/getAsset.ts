import { esploraClient, UserIssuedAsset } from "@bitmatrix/esplora-api-client";
import axios from "axios";

export const getAsset = async (assetId: string): Promise<UserIssuedAsset | undefined> => {
  const asset = (await esploraClient.asset(assetId)) as any as UserIssuedAsset;
  if (asset.chain_stats === undefined) return undefined;
  return asset;
};

export const getAssetWithBlockstream = async (assetId: string): Promise<UserIssuedAsset> => {
  return (await axios.get<UserIssuedAsset>("https://blockstream.info/liquidtestnet/api/asset/" + assetId)).data;
};
