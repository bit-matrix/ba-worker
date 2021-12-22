import { crypto } from "@script-wiz/lib-core";
import WizData from "@script-wiz/wiz-data";

export const toHex64BE = (a: string | number) => Number(a).toString(16).padStart(16, "0");

/*
 *    RECEPIENT_SCRIPTPUBKEY calculation:
 *    00 + 20 + SHA256(04 + 01000000 + b2 + 21 + RECEPIENT_PUBKEY + ac) (edited)
 */
export const getRecepientScriptPubkey = (recipientPublicKey: string) => "00" + "20" + crypto.sha256v2(WizData.fromHex("04" + "01000000" + "b2" + "21" + recipientPublicKey + "ac"));

/*
 * tx fee hesaplama:
 *
 * total_fee (1240) = base_fee (1200) + ordering_fee (40)
 * 1. x = tf/3
 * 2. tx fee = x + 2x /32 * 1 (25) = 438
 * 3. remaining tx fee = tf(1240) - txfee(438) = 802
 * 4. service comission = 650 + remaining tx fee (802) = 1452
 *
 * */
export const getTxFeeServiceCommission = (baseFee: number, serviceFee: number, orderingFee: number) => {
  const total_fee = baseFee + orderingFee;

  const x = Math.floor(total_fee / 3);
  const tx_fee = Math.floor(x + (2 * x) / (32 * 1)); // 1 = ctx.length
  const txFee = toHex64BE(tx_fee);

  const remainingTxFee = total_fee - tx_fee;
  const serviceCommission = serviceFee + remainingTxFee;

  return { txFee, serviceCommission };
};

export const splitCommitmentTxBaseHex = async (txHex: string) => {
  const tx = txHex.substring(0, 8) + "00" + txHex.substring(10);

  const part = 160;
  const p1 = tx.substring(0, part);
  const p2 = tx.substring(part, part * 2);
  const p3 = tx.substring(part * 2, part * 3);
  const p4 = tx.substring(part * 3, part * 4);
  const p5 = tx.substring(part * 4, part * 5);
  const p6 = tx.substring(part * 5, part * 5 + 36);

  const settlement = [p1, p2, p3, p4, p5, p6];
  return settlement;
};
