import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { sendTelegramMessage } from "../../../helper/sendTelegramMessage";
import { isPoolRegisteryWorker } from "./poolRegisteryWorker";

export const poolRegisteryWorker = async (newBlockHeight: number, newBlockHash: string) => {
  // console.log("newBlock.tx_count", newBlock.tx_count);

  console.log("Find new pool register worker started");

  let newTxDetails: TxDetail[] = [];

  newTxDetails = await esploraClient.blockTxs(newBlockHash);
  newTxDetails = newTxDetails.slice(1);

  try {
    for (let i = 0; i < newTxDetails.length; i++) {
      const ntx = newTxDetails[i];
      const isNewPoolRegister = await isPoolRegisteryWorker(ntx, newBlockHash, newBlockHeight);

      if (isNewPoolRegister) {
        sendTelegramMessage(
          "New pool registered " +
            "\n" +
            "New Pool Id: <code>" +
            ntx.vout[0].asset +
            "</code>\n" +
            "Block Height: <code>" +
            newBlockHeight +
            "</code>, <b>Pool Register tx</b>: <code>" +
            ntx.txid +
            "</code>"
        );
      }
    }
    // console.log(res);
  } catch (error) {
    console.error("poolWorker.error", error);
  }

  return;
};
