import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { part1 } from "./helper/part1";
import { part2 } from "./helper/part2";
import { part3 } from "./helper/part3";
import { sendRawTransaction } from "./helper/sendRawTransaction";

export const method02 = async (pool: Pool, poolConfig: BmConfig, ctx: BmCtxNew): Promise<string | undefined> => {
  console.log("Pool tx creating on method 02 for ctx new id: " + ctx.commitmentTx.txid);

  if (pool.unspentTx === undefined) throw new Error("Unspent ptx yok!!! Nassi geldin buraya 2??");

  const p1: string = part1(pool.unspentTx.txid, ctx.commitmentTx.txid);
  // console.log("part1: " + p1);

  const p2: string = part2(pool, poolConfig, ctx.callData);
  // console.log("part2: " + p2);

  const p3: string = await part3(pool, poolConfig, ctx);
  // console.log("part3: " + p3);

  const txhex = p1 + p2 + p3;

  const poolTxid = await sendRawTransaction(txhex);

  if (poolTxid) {
    console.log("poolTxid", poolTxid);
    return poolTxid;
  }

  return;
};
