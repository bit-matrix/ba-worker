// local
export const ELECTRS_URL = process.env.DB_URL || "https://electrs.bitmatrix-aggregate.com/";
export const DB_URL = process.env.DB_URL || "https://rocksdb.bitmatrix-aggregate.com/";
export const WORKER_DELAY = Number(process.env.DB_URL || 5);
