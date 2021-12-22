import { Pool } from "@bitmatrix/models";
import { crypto } from "@script-wiz/lib-core";
import WizData from "@script-wiz/wiz-data";

export const toHex64BE = (a: string | number) => Number(a).toString(16).padStart(16, "0");

/*
 * Kutucuğa 5000 sat yazdım
 *
 * %0.25 LP feesini hesaplıycaz
 * 1. 5000 / 400 = 12 *** a
 * 2. 5000 - 12 = 4988   *** b
 * 3. POOL_LBTC_VALUE_LATEST_STATE + 4988 = 1004988  *** c
 * 4. 1004988 / 16 = 62811 *** d
 * 5. POOL_LBTC_VALUE_LATEST_STATE / 16 = 62500 *** e
 * 6. POOL_TOKEN_VALUE_LATEST_STATE / 2000000 = 25000 *** f
 * 7. 62500 * 25000 = 1562500000 *** g
 * 8. 1562500000 / 62811 = 24876 *** h
 * 9. 24876 * 2000000 = 49752000000 *** i
 * 10. POOL_TOKEN_VALUE_LATEST_STATE - 49752000000 = 248000000 *** j
 * 11. 248000000 - POOL_LBTC_VALUE_LATEST_STATE = 247000000 *** k
 */
export const calc1 = (pool: Pool, val: number) => {
  const a = Math.floor(val / 400);
  console.log("a", a);
  const b = val - a;
  console.log("b", b);
  const c = Number(pool.quote.value) + b;
  console.log("c", c);
  const d = Math.floor(c / 16);
  console.log("d", d);
  const e = Math.floor(Number(pool.quote.value) / 16);
  console.log("e", e);
  const f = Math.floor(Number(pool.token.value) / 2000000);
  console.log("f", f);
  const g = e * f;
  console.log("g", g);
  const h = Math.floor(g / d);
  console.log("h", h);
  const i = h * 2000000;
  console.log("i", i);
  const j = Number(pool.token.value) - i;
  console.log("j", j);
  const k = j - 1000000;
  console.log("k", k);
  return k;
};

/* 
toHex64BE = (a) => Number(a).toString(16).padStart(16, "0");
pool = {quote:{value:1005000}, token:{value:49753000000}};
calc1 = (pool, val) => {
  const a = Math.floor(val / 400);
  console.log("a", a);
  const b = val - a;
  console.log("b", b);
  const c = Number(pool.quote.value) + b;
  console.log("c", c);
  const d = Math.floor(c / 16);
  console.log("d", d);
  const e = Math.floor(Number(pool.quote.value) / 16);
  console.log("e", e);
  const f = Math.floor(Number(pool.token.value) / 2000000);
  console.log("f", f);
  const g = e * f;
  console.log("g", g);
  const h = Math.floor(g / d);
  console.log("h", h);
  const i = h * 2000000;
  console.log("i", i);
  const j = Number(pool.token.value) - i;
  console.log("j", j);
  const k = j - 1000000;
  console.log("k", k, toHex64BE(k));
  return k;
}; 
calc1(pool, 5000);
*/

/*
 *    EX
 *    RECEPIENT_SCRIPTPUBKEY calculation:
 *    00 + 20 + SHA256(04 + 01000000 + b2 + 21 + RECEPIENT_PUBKEY + ac)
 */
// export const getRecepientScriptPubkey_EX = (recipientPublicKey: string) => "00" + "20" + crypto.sha256v2(WizData.fromHex("04" + "01000000" + "b2" + "21" + recipientPublicKey + "ac"));

/*
 *    RECEPIENT_SCRIPTPUBKEY calculation:
 *    0014 + RIPEMD160(SHA256(33-byte-recepient-pubkey))
 */
export const getRecepientScriptPubkey = (recipientPublicKey: string) => {
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

export const splitCommitmentTxBaseHex = async (txHex: string) => {
  const tx = txHex.substring(0, 8) + "00" + txHex.substring(10);

  const part = 160;
  const p1 = tx.substring(0, part);
  const p2 = tx.substring(part, part * 2);
  const p3 = tx.substring(part * 2, part * 3);
  const p4 = tx.substring(part * 3, part * 4);
  const p5 = tx.substring(part * 4, part * 5);
  const p6 = tx.substring(part * 5, part * 5 + 36);
  console.log("p6", p6.length);
  const settlement = [p1, p2, p3, p4, p5, p6];
  return settlement;
};
