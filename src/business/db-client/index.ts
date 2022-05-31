import axios from "axios";
import { DB_URL } from "../../env";
import { BmConfig, BmCtxMempool, BmCtxNew, BmPtx, BmPtxCtx, Pool } from "@bitmatrix/models";

export const clear = (): Promise<void> => axios.delete<void>(DB_URL + "clear").then((res) => res.data);

export const pools = (): Promise<Pool[]> => axios.get<Pool[]>(DB_URL + "pools").then((res) => res.data);
export const pool = (asset: string): Promise<Pool> => axios.get<Pool>(DB_URL + "pools/" + asset).then((res) => res.data);

// TODO
export const poolUpdate = (newPool: Pool): Promise<void> => axios.post<void>(DB_URL + "pools", newPool).then((res) => res.data);

export const config = (asset: string): Promise<BmConfig> => axios.get<BmConfig>(DB_URL + "config/" + asset).then((res) => res.data);

export const configAdd = (asset: string, newConfig: BmConfig): Promise<void> => axios.post<void>(DB_URL + "config/" + asset, newConfig).then((res) => res.data);

export const ctxsNew = (asset: string): Promise<BmCtxNew[]> =>
  axios
    .get<BmCtxNew[]>(DB_URL + "ctx/" + asset)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsNew", res);
      throw res.message;
    });

export const ctxNew = (asset: string, ctxid: string): Promise<BmCtxNew[]> =>
  axios
    .get<BmCtxNew[]>(DB_URL + "ctx/" + asset + "/" + ctxid)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsNew", res);
      throw res.message;
    });

export const ctxNewDelete = (asset: string, ctxid: string): Promise<void> =>
  axios
    .delete<void>(DB_URL + "ctx/" + asset + "/" + ctxid)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxNewDelete", res);
      throw res.message;
    });

export const ctxsMempool = (asset: string): Promise<BmCtxMempool[]> =>
  axios
    .get<BmCtxMempool[]>(DB_URL + "ctx/" + asset + "?mempool=true")
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });

export const ctxMempool = (asset: string, ctxid: string): Promise<BmCtxMempool> =>
  axios
    .get<BmCtxMempool>(DB_URL + "ctx/" + asset + "/" + ctxid + "?mempool=true")
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });

export const ptxs = (asset: string): Promise<BmPtx[]> =>
  axios
    .get<BmPtx[]>(DB_URL + "ptx/" + asset)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });

export const ptx = (asset: string, ptxid: string): Promise<BmPtx> =>
  axios
    .get<BmPtx>(DB_URL + "ptx/" + asset + "/" + ptxid)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxsMempool", res);
      throw res.message;
    });

export const ctxNewSave = (asset: string, value: BmCtxNew): Promise<void> =>
  axios
    .post(DB_URL + "ctx/" + asset, value)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxNewSave", res.message);
      throw res.message;
    });

export const ctxMempoolSave = (asset: string, value: BmCtxMempool): Promise<void> =>
  axios
    .post(DB_URL + "ctx/" + asset, value)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxMempoolSave", res.message);
      throw res.message;
    });

export const ptxCtx = (asset: string, ptxid: string): Promise<BmPtxCtx> =>
  axios
    .get(DB_URL + "ptx-ctx/" + asset + "/" + ptxid)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ptxCtx", res.message);
      throw res.message;
    });

export const ptxSave = (asset: string, value: BmPtx): Promise<void> =>
  axios
    .post(DB_URL + "ptx/" + asset, value)
    .then((res) => res.data)
    .catch((res) => {
      console.error("ctxMempoolSave", res.message);
      throw res.message;
    });
