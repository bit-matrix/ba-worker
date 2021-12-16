import axios from "axios";
import { DB_URL } from "../../env";

import { Pool } from "./models/Pool";
import { AssetBlockheight } from "./models/AssetBlockheight";
import { CommitmentTx } from "./models/CommitmentTx";

export const pools = (): Promise<Pool[]> => axios.get<Pool[]>(DB_URL + "pools").then((res) => res.data);

export const assetBlockheight = (asset: string): Promise<{ ctx: AssetBlockheight; ptx: AssetBlockheight }> =>
  axios
    .get<{ ctx: AssetBlockheight; ptx: AssetBlockheight }>(DB_URL + "height/" + asset)
    .then((res) => res.data)
    .catch((res) => {
      console.error("assetBlockheight", res);
      throw res.message;
    });

// export const assetBlockheightType = (asset: string, txType = "CTX" || "PTX"): Promise<AssetBlockheight | undefined> =>
//  axios.get<AssetBlockheight | undefined>(DB_URL + "height/" + asset + "/" + txType).then((res) => (res.data?.block_height ? res.data : undefined));

export const activeCtx = (asset: string): Promise<CommitmentTx[]> =>
  axios
    .get<CommitmentTx[]>(DB_URL + "ctx/" + asset)
    .then((res) => res.data)
    .catch((res) => {
      console.error("activeCtx", res);
      throw res.message;
    });

export const saveCtx = (asset: string, key: string, value: CommitmentTx): Promise<void> =>
  axios
    .post(DB_URL + "ctx/" + asset, { key, value })
    .then((res) => res.data)
    .catch((res) => {
      console.error("saveCtx", res.message);
      throw res.message;
    });

// export const savePtx = (asset: string): Promise<CommitmentTx[]> => axios.get<CommitmentTx[]>(DB_URL + asset + "/ctx").then((res) => res.data);
