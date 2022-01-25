import { BmCtxNew } from "@bitmatrix/models";
import { arithmetics64, crypto } from "@script-wiz/lib-core";
import WizData, { hexLE } from "@script-wiz/wiz-data";

export const toHex64BE = (a: string | number) => Number(a).toString(16).padStart(16, "0");

/*
 *    RECEPIENT_SCRIPTPUBKEY calculation:
 *    0014 + RIPEMD160(SHA256(33-byte-recipient-pubkey))
 */
export const getRecipientScriptPubkey = (recipientPublicKey: string) => {
  // const test_recipientPublicKey = "0268a18e809e07182802a7063e108b850c6085b2d490126807fb52156eb9ab4de4";
  // const test_spk = "00141c4b12f9f7c51b4a1284346e55722d8a9a5d1de1";

  // console.log("recipientPublicKey", recipientPublicKey);

  const sha256 = crypto.sha256v2(WizData.fromHex(recipientPublicKey));
  // console.log("sha256", sha256);

  const rip = crypto.ripemd160(WizData.fromHex(sha256)).toString();
  // console.log("rip", rip);

  const compiledData = "0014" + rip;
  // console.log("compiledData", compiledData);
  // console.log("compiledTest", test_spk);

  return compiledData;
};

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

  console.log("txFee, serviceCommission", tx_fee, serviceCommission);
  return { txFee, serviceCommission: toHex64BE(serviceCommission) };
};

const lexicographicalEx = (aTxid: string, bTxid: string): number => {
  if (aTxid.length !== 64 || bTxid.length !== 64) throw new Error("Lexicographical error. Wrong length tx ids: " + aTxid + "," + bTxid);
  const a = aTxid.substring(48);
  const b = bTxid.substring(48);

  return Number("0x" + b) - Number("0x" + a);
};

const lexicographical = (aTxid: string, bTxid: string): number => {
  if (aTxid.length !== 64 || bTxid.length !== 64) throw new Error("Lexicographical error. Wrong length tx ids: " + aTxid + "," + bTxid);
  const a = hexLE(aTxid.substring(48));
  const b = hexLE(bTxid.substring(48));

  if (a === b) return 0;
  return arithmetics64.greaterThan64(WizData.fromHex(b), WizData.fromHex(a)).number === 1 ? 1 : -1;
};

export const topCtxs = (newCtxs: BmCtxNew[], limit: number = 3): BmCtxNew[] => {
  const sortedNewCtxs = newCtxs.sort((a, b) => {
    const orderingFeeDiff = b.callData.orderingFee - a.callData.orderingFee;
    const lexicographicalDiff = lexicographical(a.commitmentTx.txid, b.commitmentTx.txid);
    return orderingFeeDiff || lexicographicalDiff;
  });

  const result = sortedNewCtxs.length >= limit ? sortedNewCtxs.slice(0, limit - 1) : sortedNewCtxs;
  return result;
};
