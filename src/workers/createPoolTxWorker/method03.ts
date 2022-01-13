import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { part1 } from "./helper/part1";
import { part2b } from "./helper/part2b";
import { part3 } from "./helper/part3";
import { sendRawTransaction } from "./helper/sendRawTransaction";

export const method03 = async (pool: Pool, poolConfig: BmConfig, ctx: BmCtxNew): Promise<string | undefined> => {
  console.log("Pool tx creating on method 03 for ctx new id: " + ctx.commitmentTx.txid);

  try {
    if (pool.unspentTx === undefined) throw new Error("Unspent ptx yok!!! Nassi geldin buraya 3??");

    const p1: string = part1(pool.unspentTx.txid, ctx.commitmentTx.txid);
    // console.log("part1: " + p1);

    const p2: string = part2b(pool, poolConfig, ctx.callData);
    // console.log("part2b: " + p2);

    const p3: string = await part3(pool, poolConfig, ctx);
    // console.log("part3: " + p3);

    const txhex = p1 + p2 + p3;

    const poolTxid = await sendRawTransaction(txhex);

    if (poolTxid) {
      console.log("poolTxid", poolTxid);
      return poolTxid;
    }
  } catch (error) {
    throw new Error((error as any).message);
  } finally {
    return;
  }
};
