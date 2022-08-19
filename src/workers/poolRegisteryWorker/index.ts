import { TxDetail } from "@bitmatrix/esplora-api-client";
import { sendSlackMessage } from "../../helper/sendSlackMessage";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isPoolRegistery } from "./isPoolRegistery";

export const poolRegisteryWorker = async (txDetails: TxDetail[], synced: boolean) => {
  console.log("-------------------POOL REGISTERY WORKER-------------------------");

  try {
    for (let i = 0; i < txDetails.length; i++) {
      const ntx = txDetails[i];
      const isNewPoolRegister = await isPoolRegistery(ntx);

      if (isNewPoolRegister && synced) {
        console.log("poolRegisteryWorker", ntx);

        await sendTelegramMessage(
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

        // sendSlackMessage(
        //   "*New* *Pool* *Registered*" +
        //     "\n" +
        //     "*New* *Pool* *Id:* " +
        //     ntx.vout[0].asset +
        //     "\n" +
        //     "*Block* *Height:* " +
        //     ntx.status.block_height +
        //     "\n" +
        //     "*Pool* *Register* *Tx*: " +
        //     ntx.txid
        // );
      }
    }
    // console.log(res);
  } catch (error) {
    console.error("poolWorker.error", error);
  }

  return;
};
