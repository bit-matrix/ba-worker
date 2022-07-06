import { TxDetailRPC } from "@bitmatrix/models";
import { pools } from "../../../business/db-client";
import { RedisClient } from "../../../redisClient/RedisClient";
import { poolTxFinder } from "./poolTxFinder";

const redisClient = new RedisClient("redis://localhost:6379");

export const poolTxWorker = async () => {
  //redisten ctx'leri cekme.
  //todo: valide etme
  const values = await redisClient.getAllValues();

  //TODO:Pool transaction Id'leri update etme

  //Pool validasyonlarından geçirme
  console.log(values, "values");
  const ps = await pools();
  for (let i = 0; i < values.length; i++) {
    const newTxDetail = values[i] as TxDetailRPC;
    await poolTxFinder(newTxDetail.txid, ps);

    // if (newTxDetail.field !== true)
    await redisClient.updateField(newTxDetail.txid, true);
    console.log("here");
  }
};
