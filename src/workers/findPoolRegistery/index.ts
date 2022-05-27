import { Block, esploraClient, TxDetail } from "@bitmatrix/esplora-api-client";
import { BmBlockInfo, BmTxInfo, PAsset, Pool } from "@bitmatrix/models";
import { poolUpdate } from "../../business/db-client";
import { sendTelegramMessage } from "../../helper/sendTelegramMessage";
import { isPoolRegisteryWorker } from "./poolRegisteryWorker";

const lbtcAsset = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
const usdtAsset = "f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958";
const cadAsset = "ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926";

const tickerFinder = (asset: string): { ticker: string; name: string } => {
  if (asset === lbtcAsset) {
    return { ticker: "tL-BTC", name: "Liquid Bitcoin" };
  } else if (asset === usdtAsset) {
    return { ticker: "tL-USDt", name: "Liquid Tether" };
  } else if (asset === cadAsset) {
    return { ticker: "LCAD", name: "Liquid Canadian Dollar" };
  }

  return { ticker: asset.slice(0, 4), name: "unknown" };
};

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
        const pair2 = ntx.vout[1]; // token
        const lp = ntx.vout[2]; // lp
        const pair1 = ntx.vout[3]; // quote

        const quoteTicker = tickerFinder(pair1.asset || "");
        const tokenTicker = tickerFinder(pair2.asset || "");
        const lpTicker = tickerFinder(lp.asset || "");

        const quote: PAsset = {
          ticker: quoteTicker.ticker,
          name: quoteTicker.name,
          asset: pair1.asset || "",
          value: pair1.value?.toString() || "",
        };

        const token: PAsset = {
          ticker: tokenTicker.ticker,
          name: tokenTicker.name,
          asset: pair2.asset || "",
          value: pair2.value?.toString() || "",
        };

        const lpAsset: PAsset = {
          ticker: lpTicker.ticker,
          name: lpTicker.name,
          asset: lp.asset || "",
          value: lp.value?.toString() || "",
        };

        const initialTx: BmTxInfo = {
          txid: ntx.txid,
          block_height: newBlock.height,
          block_hash: newBlock.id,
        };

        const lastSyncedBlock: BmBlockInfo = {
          block_height: newBlock.height,
          block_hash: newBlock.id,
        };

        const newPool: Pool = {
          id: ntx.vout[0].asset || "",
          quote,
          token,
          lp: lpAsset,
          initialTx,
          lastSyncedBlock,
          bestBlockHeight: newBlock.height,
          synced: false,
          unspentTx: initialTx,
          lastSentPtx: ntx.txid,
          active: true,
        };

        const res = await poolUpdate(newPool);

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
