import Numeral from "numeral";
import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, BmChart, CALL_METHOD, Pool } from "@bitmatrix/models";
import { pools, poolTxHistorySave, poolUpdate } from "../../business/db-client";
import { sendSlackMessage } from "../../helper/sendSlackMessage";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { tokenPriceCalculation } from "../../helper/tokenPriceCalculation";

export const nftHunterWorker = async (newTxDetails: TxDetail[], waitingTxs: BitmatrixStoreData[], synced: boolean) => {
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

        const poolTxDetails = waitingTxs.find((ptx) => ptx.poolTxInfo?.txId === tx.txid);

        if (poolTxDetails) {
          let volumeQuote = 0;
          let volumeToken = 0;

          if (poolTxDetails.commitmentData.methodCall === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
            volumeQuote = Number(newPool.quote.value);
            volumeToken = volumeQuote * newPool.tokenPrice;
          } else {
            volumeToken = Number(newPool.token.value);
            volumeQuote = Math.floor(volumeToken / newPool.tokenPrice);
          }

          const result: BmChart = {
            time: tx.status.block_time,
            ptxid: tx.txid,
            method: poolTxDetails.commitmentData.methodCall as CALL_METHOD,
            value: {
              quote: Number(newPool.quote.value),
              token: Number(newPool.token.value),
              lp: Number(newPool.lp.value),
            },
            price: newPool.tokenPrice,
            volume: {
              quote: volumeQuote,
              token: volumeToken,
            },
          };

          await poolTxHistorySave(newPool.id, result);
        }

        await poolUpdate(newPool);

        if (synced) {
          await sendTelegramMessage(
            "<b>New Pool Last State Detected</b>" +
              "\nPool Id: " +
              newPool.id +
              "\nPool Version: " +
              newPool.version +
              "\nCommitment Data \n<b>Pair 1 Value</b>: <code>" +
              Numeral(newPool.quote.value) +
              " " +
              newPool.quote.ticker +
              "</code>, <b>Pair 2 Value</b>: <code>" +
              newPool.token.value +
              " " +
              Numeral(newPool.token.ticker) +
              "</code>, <b>Lp Token Value</b>: <code>" +
              Numeral(newPool.lp.value) +
              " " +
              newPool.lp.ticker +
              "</code>"
          );

          // sendSlackMessage(
          //   "*New* *Pool* *Last* *State* *Detected* " +
          //     "\n" +
          //     "*Pool:* " +
          //     currentPool.id +
          //     "\n" +
          //     "*Commitment* *Data:* _Pair_ _1_ _Value_ _-_ " +
          //     newPool.quote.value +
          //     ", _Pair2_ _Value_ _-_ " +
          //     newPool.token.value
          // );
        }
      }
    }
  });
};
