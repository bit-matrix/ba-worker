import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { pool } from "@bitmatrix/lib";
import { BmChart, Pool } from "@bitmatrix/models";
import { pools, poolTxHistorySave, poolUpdate } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { tokenPriceCalculation } from "../../helper/tokenPriceCalculation";

export const nftHunterWorker = async (newTxDetails: TxDetail[], synced: boolean) => {
  console.log("-------------------NFT HUNTER-------------------------");

  const bitmatrixPools = await pools();

  newTxDetails.forEach(async (tx) => {
    const outspends = await esploraClient.txOutspends(tx.txid);
    const vout0 = tx.vout[0];
    const currentPool = bitmatrixPools.find((ps) => ps.id === vout0.asset);

    if (currentPool) {
      const newPool: Pool = { ...currentPool };
      newPool.token.value = tx.vout[1].value?.toString();
      newPool.lp.value = tx.vout[2].value?.toString();
      newPool.quote.value = tx.vout[3].value?.toString();
      newPool.lastStateTxId = tx.txid;
      newPool.tokenPrice = tokenPriceCalculation(newPool.token, newPool.quote);

      const result: BmChart = {
        time: tx.status.block_time,
        ptxid: tx.txid,
        value: {
          quote: Number(newPool.quote.value) * Math.pow(10, 8 - newPool.quote.precision),
          token: Number(newPool.token.value) * Math.pow(10, 8 - newPool.token.precision),
          lp: Number(newPool.lp.value),
        },
        price: newPool.tokenPrice,
        lpFeeTier: Object.values(pool.lpFeeTiers)[newPool.lpFeeTierIndex.number],
      };

      if (outspends[0].spent === false) {
        await poolUpdate(newPool);
      } else {
        await poolUpdate(newPool);
        await poolTxHistorySave(newPool.id, result);
      }

      if (synced) {
        await sendTelegramMessage(
          "New Pool Last State Detected : " +
            "Pool: " +
            currentPool.id +
            "\n" +
            "Commitment Data: <b>Pair 1 Value</b>: <code>" +
            newPool.quote.value +
            "</code>, <b>Pair2 Value</b>: <code>" +
            newPool.token.value +
            "</code>"
        );
      }
    }
  });
};
