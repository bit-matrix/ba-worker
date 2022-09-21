import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { lpFeeTiers } from "@bitmatrix/lib/pool";
import { BmChart, Pool } from "@bitmatrix/models";
import { pools, poolTxHistorySave, poolUpdate } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { tokenPriceCalculation } from "../../helper/tokenPriceCalculation";

export const nftHunterWorker = async (newTxDetails: TxDetail[], synced: boolean) => {
  console.log("-------------------NFT HUNTER-------------------------");

  const bitmatrixPools = await pools();

  newTxDetails.forEach(async (tx) => {
    const outspends = await esploraClient.txOutspends(tx.txid);

    if (outspends[0].spent === false) {
      const vout0 = tx.vout[0];
      const currentPool = bitmatrixPools.find((ps) => ps.id === vout0.asset);

      if (currentPool) {
        const newPool: Pool = { ...currentPool };
        newPool.token.value = tx.vout[1].value?.toString();
        newPool.lp.value = tx.vout[2].value?.toString();
        newPool.quote.value = tx.vout[3].value?.toString();
        newPool.lastStateTxId = tx.txid;
        newPool.tokenPrice = tokenPriceCalculation(newPool.token, newPool.quote);

        const volumeQuote = Number(newPool.quote.value) * Math.pow(10, 8 - newPool.quote.precision);
        const volumeToken = volumeQuote * newPool.tokenPrice;

        const result: BmChart = {
          timestamp: tx.status.block_time,
          ptxid: tx.txid,
          value: {
            quote: Number(newPool.quote.value) * Math.pow(10, 8 - newPool.quote.precision),
            token: Number(newPool.token.value) * Math.pow(10, 8 - newPool.token.precision),
            lp: Number(newPool.lp.value),
          },
          price: newPool.tokenPrice,
          volume: {
            quote: volumeQuote,
            token: volumeToken,
          },
          lpFeeTier: Object.values(lpFeeTiers)[newPool.lpFeeTierIndex.number],
        };

        await poolTxHistorySave(newPool.id, result);

        await poolUpdate(newPool);

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
    }
  });
};
