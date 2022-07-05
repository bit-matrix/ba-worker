import { RedisClientType } from "@redis/client";
import * as redis from "redis";
import { Custom } from "./Custom";
import IRedisClient from "./IRedisClient";

export class RedisClient implements IRedisClient {
  private redisClient: RedisClientType;

  constructor(url?: string) {
    //if url is optional application will start using default redis url
    this.redisClient = redis.createClient({
      url,
    });
    this.redisClient.connect();
  }

  addKey = async (key: string, seconds: number, value: object): Promise<string> => this.redisClient.SETEX(key, seconds, JSON.stringify(value));

  getTTL = async (key: string): Promise<number> => this.redisClient.TTL(key);

  getAllKeys = async (): Promise<string[]> => await this.redisClient.keys("*");

  getDataByKey = async <T>(key: string): Promise<T> => this.redisClient.get(key).then<T>((response: string | null) => (response ? JSON.parse(response) : {}));

  getAllValues = async <T>(): Promise<T[]> => {
    const keys = await this.getAllKeys();

    const valuesPromises = keys.map((key: string) => this.redisClient.get(key));

    const values = await Promise.all(valuesPromises);

    return values.map<T>((val: string | null) => (val ? JSON.parse(val) : {}));
  };

  removeKeys = async (keys: string[]): Promise<number> => this.redisClient.del(keys);

  updateField = async <T extends Custom>(key: string, value: any): Promise<string> => {
    const ttl = await this.getTTL(key);
    const data = await this.getDataByKey<T>(key);
    data.field = value;
    //it will return OK
    return this.addKey(key, ttl, data);
  };
}