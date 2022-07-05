import { TxDetail } from "@bitmatrix/esplora-api-client";
import { CALL_METHOD, Pool } from "@bitmatrix/models";
import { sendTelegramMessage } from "../../../helper/sendTelegramMessage";
import { commitmentFinder } from "./commitmentFinder";

export const commitmentWorker = async (pools: Pool[], newTxDetails: TxDetail[]) => {
  for (let i = 0; i < newTxDetails.length; i++) {
    const newTxDetail = newTxDetails[i];

    commitmentFinder(newTxDetail.txid, pools)
      .then((data) => {
        console.log(data);

        sendTelegramMessage(
          "Pool: " +
            data.poolId +
            "\n" +
            "New Commitment Tx V2: <code>" +
            newTxDetail.txid +
            "</code>\n" +
            "Commitment Data: <b>Method</b>: <code>" +
            data.methodCall +
            "</code>, <b>Value</b>: <code>" +
            data.cmtOutput2DecimalValue +
            "</code>"
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
