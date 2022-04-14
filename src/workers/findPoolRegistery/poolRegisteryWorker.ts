import { Block, esploraClient, TxDetail, TxOutSpend } from "@bitmatrix/esplora-api-client";
import { Pool } from "@bitmatrix/models";
import { getAsset } from "../../helper/getAsset";

const lbtcAsset = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
const OP_RETURN_BANANA = "6a204172a97b9f6409ecf6b3039fb51eda9e837e8610f836abe1032fe6fd59529776";

export const isPoolRegisteryWorker = async (newBlock: Block, newTxDetail: TxDetail, pools: Pool[]): Promise<boolean> => {
  console.log("Is pool registery worker started");

  // Pool already registered
  if (pools.findIndex((x) => newTxDetail.vout[0].asset === x.id) > -1) return false;

  // Pool transaction inputs lenght must be 4
  if (newTxDetail.vin.length !== 4) return false;

  // Pool transaction outputs lenght must be 6
  if (newTxDetail.vout.length !== 6) return false;

  /*
   * Step 0:
   * Eğer bir işlemin sondan önceki outputu “muz” hashini örnekte olduğu gibi
   * (4172a97b9f6409ecf6b3039fb51eda9e837e8610f836abe1032fe6fd59529776)
   * OP_RETURN pushluyor ise
   *
   */
  if (newTxDetail.vout[4].scriptpubkey !== OP_RETURN_BANANA) return false;

  /*
   * Step 1:
   * İlk outputta taşınan asset ID (örnekte a701f8c859cfcda6e5232935f50569174b425cd458d1fcf74d1e43537f45fd69) ‘nin
   * toplam sirkülasyonunun “1” olduğunu ve reissuance tokens’ının olmadığını kontrol edelim.
   *
   */

  if (!newTxDetail.vout[0].asset) return false;
  const mayPoolAssetId = newTxDetail.vout[0].asset;
  const poolAsset = await getAsset(mayPoolAssetId);
  if (poolAsset === undefined) return false;
  if (poolAsset.chain_stats.issued_amount !== 1) return false;
  if (poolAsset.chain_stats.reissuance_tokens !== 0) return false;

  /*
   * Step 2:
   * Üçüncü outputta taşınan LP assetinin (örnekte 382470f8970154abc97374f8ec63a2b2852814e0dffc2339dfa6057aa5747e84)
   * toplam sirkülasyonunun “2,000,000,000” olduğunu ve reissuance tokens’ının olmadığını kontrol edelim.
   *
   */
  if (!newTxDetail.vout[2].asset) return false;
  const mayLPAssetId = newTxDetail.vout[2].asset;
  const lpAsset = await getAsset(mayLPAssetId);
  if (lpAsset === undefined) return false;
  if (lpAsset.chain_stats.issued_amount !== 2000000000) return false;
  if (lpAsset.chain_stats.reissuance_tokens !== 0) return false;

  /**
   * Step 3.a:
   * Üçüncü outputta taşınan LP asset değerini (örnekte 1,999,990,000)  2,000,000,000 den çıkaralım ve sonuca “LP circulation diyelim”
   * Örnekte LP sirkülasyonu = 2000000000 - 1999990000 = 10000
   * Dördüncü outputta taşınan assetin L-BTC olduğunu kontrol edelim, ve sats değerinin (1,000,000), [LP circulation * 100]’ e eşit olduğunu kontrol edelim:
   * Örnekte = 10000 * 100 =  1000000 :white_check_mark: (edited)
   *
   */
  if (!newTxDetail.vout[2].value) return false;
  const lpCirculation = 2000000000 - newTxDetail.vout[2].value; // 10000

  /*
   * Step 3.b:
   * Dördüncü outputta taşınan assetin L-BTC olduğunu kontrol edelim
   * ve sats değerinin (1,000,000), [LP circulation * 100]’ e eşit olduğunu kontrol edelim:
   *
   */
  if (!newTxDetail.vout[3].asset) return false;
  if (newTxDetail.vout[3].asset !== lbtcAsset) return false;
  if (!newTxDetail.vout[3].value) return false;
  if (newTxDetail.vout[3].value !== lpCirculation * 100) return false;

  return true;
};
