import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { part1 } from "./helper/part1";
import { part2 } from "./helper/part2";
import { part3 } from "./helper/part3";

export const method01 = async (pool: Pool, poolConfig: BmConfig, ctx: BmCtxNew) => {
  console.log("Pool tx creating on method 01 for ctx new id: " + ctx.commitmentTx.txid);

  const p1: string = part1(pool.unspentTx.txid, ctx.commitmentTx.txid);
  console.log("part1: " + p1);

  const p2: string = part2(pool, poolConfig, ctx.callData);
  console.log("part2: " + p2);

  const p3: string = await part3(pool, poolConfig, ctx);
  console.log("part3: " + p3);
};
