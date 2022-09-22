import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BitmatrixStoreData, CALL_METHOD, CommitmentTxHistory, Pool } from "@bitmatrix/models";
import { redisClient } from "@bitmatrix/redis-client";
import { utils } from "@script-wiz/lib-core";
import { ctxHistorySave, pool } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { validatePoolTx } from "../poolTxWorker/validatePoolTx";

export const isCtxSpentWorker = async (waitingTxs: BitmatrixStoreData[], synced: boolean) => {
  console.log("-------------------IS CTX SPENT WORKER-------------------------");

  if (waitingTxs.length > 0) {
    let completedTxs = [];
    for (const tx of waitingTxs) {
      const txId = tx.commitmentData.transaction.txid;

      const outspends = await esploraClient.txOutspends(txId);

      if (outspends[0].spent) {
        let isSuccess: boolean;
        let errorMessages: string[] = [];

        const poolTxId = outspends[0].txid || "";

        const poolTx = await esploraClient.tx(poolTxId);
        const poolTxOutputs = poolTx.vout;

        const scriptPubKey = "0014" + utils.publicKeyToScriptPubkey(tx.commitmentData.publicKey);

        const currentOutput = poolTxOutputs.find((output) => output.scriptpubkey === scriptPubKey);

        if (currentOutput) {
          isSuccess = tx.commitmentData.cmtOutput2.asset !== currentOutput.asset ? true : false;
        } else {
          isSuccess = false;
        }

        if (!isSuccess) {
          const currentPool = await pool(poolTx.vout[0].asset || "");
          const poolCurrenState: Pool = { ...currentPool };
          poolCurrenState.token.value = poolTx.vout[1].value?.toString() || "";
          poolCurrenState.quote.value = poolTx.vout[3].value?.toString() || "";
          poolCurrenState.lp.value = poolTx.vout[2].value?.toString() || "";
          errorMessages = validatePoolTx(tx.commitmentData, poolCurrenState).errorMessages;
        }

        let value = "";

        if (isSuccess) {
          if (tx.commitmentData.methodCall === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) {
            value = tx.commitmentData.cmtOutput2.value.toString();
          } else if (tx.commitmentData.methodCall === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE && currentOutput?.value) {
            value = (currentOutput.value / 100000000).toString() || "";
          }
        }

        const commitmentTxHistory: CommitmentTxHistory = {
          poolId: tx.commitmentData.poolId,
          method: tx.commitmentData.methodCall as CALL_METHOD,
          txId,
          isSuccess,
          timestamp: outspends[0].status?.block_time || 0,
          failReasons: errorMessages.join(", ") || "",
          value,
          poolTxId,
        };

        completedTxs.push(txId);
        await redisClient.removeKey(txId);
        await ctxHistorySave(txId, commitmentTxHistory);
      }
    }

    if (synced && completedTxs.length > 0) {
      await sendTelegramMessage("Swap Completed for : <code>" + completedTxs.join(",") + "</code>");
    }
  }
};
