const base_host = process.env.BASE_HOST || "host.docker.internal";

const electrs_port = process.env.ELECTRS_PORT || "30001";
const electrs_host = process.env.ELECTRS_HOST || base_host;
const electrs_url = process.env.ELECTRS_URL || `http://${electrs_host}:${electrs_port}`;

const redis_port = process.env.REDIS_PORT || "6379";
const redis_host = process.env.REDIS_HOST || base_host;
const redis_url = process.env.REDIS_URL || `redis://${redis_host}:${redis_port}`;

const api_port = process.env.API_PORT || "8000";
const api_host = process.env.API_HOST || base_host;
const api_url = process.env.API_URL || `http://${api_host}:${api_port}`;

const db_port = process.env.DB_PORT || "8001";
const db_host = process.env.DB_HOST || base_host;
const db_url = process.env.DB_URL || `http://${db_host}:${db_port}`;

const bitmatrix_rpc_port = process.env.DB_PORT || "8888";
const bitmatrix_rpc_host = process.env.DB_HOST || base_host;
const bitmatrix_rpc_url = process.env.DB_URL || `http://${bitmatrix_rpc_host}:${bitmatrix_rpc_port}`;

const telegram_token = "AAGLP1BTJQ9i7Y2Old7MsV3daCWg0RVLqzs";
const telegram_chat_id = "-707696434";

export const ELECTRS_URL = electrs_url + "/";
export const DB_URL = db_url + "/";
export const HISTORY_DB_URL = api_url + "/";
export const BITMATRIX_RPC_URL = bitmatrix_rpc_url + "/";
export const REDIS_URL = redis_url;

export const FETCH_ASSET_URL = "https://blockstream.info/liquidtestnet/api/asset/";

export const BITMATRIX_WATCHTOWER = {
  token: telegram_token,
  chatId: telegram_chat_id,
};
export const TELEGRAM_URL = "https://api.telegram.org/bot2145331675:";

export const LBTC_ASSET = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
export const USDT_ASSET = "f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958";
export const CAD_ASSET = "ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926";
export const FUSD_ASSET = "0d86b2f6a8c3b02a8c7c8836b83a081e68b7e2b4bcdfc58981fc5486f59f7518";

export const REDIS_EXPIRE_TIME = 60000;

export const INNER_PUBLIC_KEY = "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624";

export const TEAM_ADDRESS = "001600148f27f0ac00dcfed125ea303fa3c46bd7284ab77d";
