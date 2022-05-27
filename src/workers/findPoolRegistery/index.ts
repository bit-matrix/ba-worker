import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isPoolRegisteryWorker } from "./poolRegisteryWorker";

export const poolRegisteryWorker = async (newBlock: Block) => {
  // console.log("newBlock.tx_count", newBlock.tx_count);

  console.log("Find new pool register worker started");

  let newTxDetails: TxDetail[] = [];
  if (newBlock.tx_count > 1) {
    newTxDetails = await esploraClient.blockTxs(newBlock.id);
    newTxDetails = newTxDetails.slice(1);
  }

  try {
    for (let i = 0; i < newTxDetails.length; i++) {
      const ntx = newTxDetails[i];
      const isNewPoolRegister = await isPoolRegisteryWorker(ntx);

      if (isNewPoolRegister) {
        console.log("block no :", newBlock);
        console.log("txıD", ntx.txid);

        sendTelegramMessage(
          "New pool registered " +
            "\n" +
            "New Pool Id: <code>" +
            ntx.vout[0].asset +
            "</code>\n" +
            "Block Height: <code>" +
            newBlock.height +
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
