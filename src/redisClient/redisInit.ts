import { RedisClient } from "./RedisClient";

let redisClient: RedisClient;

const redisInit = (url: string) => {
  redisClient = new RedisClient(url);
};

export { redisInit, redisClient };
