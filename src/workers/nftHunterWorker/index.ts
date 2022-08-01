import { esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { Pool } from "@bitmatrix/models";
import { pools, poolUpdate } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";

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

        if (newPool.unspentTx) {
          newPool.unspentTx.txid = tx.txid;
          newPool.unspentTx.block_hash = tx.status.block_hash;
          newPool.unspentTx.block_height = tx.status.block_height;
        }

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
