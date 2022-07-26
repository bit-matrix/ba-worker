import axios from "axios";
import { DB_URL } from "../../env";
import { BmConfig, Pool, AppSync } from "@bitmatrix/models";

export const pools = (): Promise<Pool[]> => axios.get<Pool[]>(DB_URL + "pools").then((res) => res.data);
export const pool = (asset: string): Promise<Pool> => axios.get<Pool>(DB_URL + "pools/" + asset).then((res) => res.data);

// TODO
export const poolUpdate = (newPool: Pool): Promise<void> => axios.post<void>(DB_URL + "pools", newPool).then((res) => res.data);

export const config = (): Promise<BmConfig> => axios.get<BmConfig>("https://raw.githubusercontent.com/bit-matrix/bitmatrix-app-config/master/testnet.json").then((res) => res.data);

// appSync
export const getLastAppSyncState = (): Promise<AppSync> => axios.get<AppSync>(DB_URL + "appSync").then((res) => res.data);
export const updateAppSyncState = (newState: AppSync): Promise<void> => axios.post<void>(DB_URL + "appSync", newState).then((res) => res.data);
