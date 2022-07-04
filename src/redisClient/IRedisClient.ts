interface IRedisClient {
  addKey: (key: string, seconds: number, value: object) => Promise<string>;
  getAllKeys: () => Promise<string[]>;
  getDataByKey: <T>(key: string) => Promise<T>;
  getAllValues: <T>() => Promise<T[]>;
  removeKeys: (keys: string[]) => Promise<number>;
  updateField: (keys: string, value: any) => Promise<string>;
}

export default IRedisClient;
