// prod
export const ELECTRS_URL = process.env.DB_URL || "http://127.0.0.1:3000/";
export const DB_URL = process.env.DB_URL || "http://127.0.0.1:4499/";
export const WORKER_DELAY = Number(process.env.DB_URL || 5);
