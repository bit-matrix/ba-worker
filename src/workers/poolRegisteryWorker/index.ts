import { TxDetail } from "@bitmatrix/esplora-api-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isPoolRegistery } from "./isPoolRegistery";

export const poolRegisteryWorker = async (txDetails: TxDetail[], synced: boolean) => {
  console.log("-------------------POOL REGISTERY WORKER-------------------------");

  try {
    for (let i = 0; i < txDetails.length; i++) {
      const ntx = txDetails[i];
      const isNewPoolRegister = await isPoolRegistery(ntx);

      if (isNewPoolRegister && synced) {
        sendTelegramMessage(
          "New pool registered " +
            "\n" +
            "New Pool Id: <code>" +
            ntx.vout[0].asset +
            "</code>\n" +
            "Block Height: <code>" +
            ntx.status.block_height +
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
