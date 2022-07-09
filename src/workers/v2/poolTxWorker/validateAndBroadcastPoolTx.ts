import Decimal from "decimal.js";
import { convertion } from "@script-wiz/lib-core";
import WizData from "@script-wiz/wiz-data";
import { CTXFinderResult, CTXPTXResult, Pool } from "@bitmatrix/models";

export const validateAndBroadcastPoolTx = async (value: CTXFinderResult, pools: Pool[]) => {
  const cof = value;
  const poolData = cof.pool;
  const method = cof.methodCall;

  let errorMessages = [];

  let output = {
    assetId: "",
    value: 0,
  };

  const result: CTXPTXResult = {
    new_pool_pair_1_liquidity: 0,
    new_pool_pair_2_liquidity: 0,
    user_supply_total: 0,
    user_supply_lp_fees: 0,
    user_supply_available: 0,
    constant_coefficient: 0,
    constant_coefficient_downgraded: 0,
    new_pair_1_pool_liquidity_apx_1: 0,
    new_pair_1_pool_liquidity_apx_2: 0,
    payout_additional_fees: 0,
    user_received_pair_1_apx: 0,
    user_received_pair_1: 0,
    new_pair_2_pool_liquidity_apx_1: 0,
    new_pair_2_pool_liquidity_apx_2: 0,
    user_received_pair_2_apx: 0,
    user_received_pair_2: 0,
  };

  //const poolId = cof.poolId;

  //get pool
  //const poolReq = await axios.get(`https://rocksdb.basebitmatrix.com/pools/${poolId}`);
  //const poolData = poolReq.data;

  // 1-Havuzun güncel pair_1 liquidity miktarına pool_pair_1_liquidity ismini ver.
  const pool_pair_1_liquidity = Number(poolData.quote.value);

  // 2-Havuzun güncel pair_2 liquidity miktarına pool_pair_2_liquidity ismini ver.
  const pool_pair_2_liquidity = Number(poolData.token.value);

  // transaction outputs
  const commitmentOutputs = cof.outputs;

  //commitment output 2
  const commitmentOutput2 = commitmentOutputs[2];

  // commitment Output2 Asset Id
  const commitmentOutput2AssetId = commitmentOutput2.asset;

  //pool detail rocks db den geldiği için asset, yeni pool modelde assetHash olacak
  const pair_1_asset_id = poolData.quote.assetHash;
  const pair_2_asset_id = poolData.token.assetHash;

  const pair_1_pool_supply = Number(poolData.quote.value);

  const pair_2_pool_supply = Number(poolData.token.value);

  const pair_1_coefficient = 20;

  const pair_2_coefficient = Math.floor(pair_2_pool_supply / pair_1_pool_supply) * pair_1_coefficient;

  //   9-pool_pair_1_liquidity değerini pair_1_coefficient’a böl ve sonuca pool_pair_1_liquidity_downgraded ismini ver
  const pool_pair_1_liquidity_downgraded = Math.floor(pool_pair_1_liquidity / pair_1_coefficient);

  // 10-pool_pair_2_liquidity değerini pair_2_coefficient’a böl ve sonuca pool_pair_2_liquidity_downgraded ismini ver
  const pool_pair_2_liquidity_downgraded = Math.floor(pool_pair_2_liquidity / pair_2_coefficient);

  // 11-pool_pair_1_liquidity_downgraded ile pool_pair_2_liquidity_downgraded ‘I çarp ve sonuca pool_constant ismini ver.
  const pool_constant = Math.floor(pool_pair_1_liquidity_downgraded * pool_pair_2_liquidity_downgraded);

  if (method === "01") {
    //3-Commitment output 2 asset ID’sinin pair_1_asset_id olduğunu kontrol et.
    if (commitmentOutput2AssetId !== pair_1_asset_id) errorMessages.push("Commitment Output 2 AssetId must be equal to pair_1_asset_id");

    //   4-Commitment output 2 miktarına user_supply_total ismini ver.
    result.user_supply_total = new Decimal(commitmentOutput2.value).mul(100000000).toNumber();

    if (result.user_supply_total > pool_pair_1_liquidity) {
      errorMessages.push("Supply overflow");

      output.assetId = pair_1_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }

    //5- user_supply_total ‘ı 500’e böl ve bölüm sonucu bir tam sayı olarak ele alıp user_supply_lp_fees ismini ver.
    result.user_supply_lp_fees = Math.floor(result.user_supply_total / 500);

    //   6-user_supply_total’ dan user_supply_lp_fees’ı çıkar ve sonuca user_supply_available ismini ver.
    result.user_supply_available = Math.floor(result.user_supply_total - result.user_supply_lp_fees);

    //   7-pool_pair_1_liquidity ile user_supply_available’i topla ve sonuca constant_coefficient ismini ver.
    result.constant_coefficient = Math.floor(pool_pair_1_liquidity + result.user_supply_available);

    //   8-constant_coefficient’ı pair_1_coefficient ’a böl ve bölüm sonucunu bir tam sayı olarak ele alıp constant_coefficient_downgraded ismini ver.

    result.constant_coefficient_downgraded = Math.floor(result.constant_coefficient / pair_1_coefficient);

    // 12-pool_constant değerini constant_coefficient_downgraded ‘e böl ve sonuca new_pair_2_pool_liquidity_apx_1 ismini ver.
    result.new_pair_2_pool_liquidity_apx_1 = Math.floor(pool_constant / result.constant_coefficient_downgraded);

    // 13-new_pair_2_pool_liquidity_apx_1 değerini pair_2_coefficient ile çarp ve sonuca new_pair_2_pool_liquidity_apx_2 ismini ver.
    result.new_pair_2_pool_liquidity_apx_2 = Math.floor(result.new_pair_2_pool_liquidity_apx_1 * pair_2_coefficient);

    // 14-pool_pair_2_liquidity değerinden new_pair_2_pool_liquidity_apx_2 değerini çıkar ve sonuca user_received_pair_2_apx ismini ver.
    result.user_received_pair_2_apx = Math.floor(pool_pair_2_liquidity - result.new_pair_2_pool_liquidity_apx_2);

    // 15-pair_2_coefficient değerini 2 ile çarp ve sonuca payout_additional_fees ismini ver.
    result.payout_additional_fees = Math.floor(pair_2_coefficient * 2);

    // 16-user_received_pair_2_apx değerinden payout_additional_fees değerini çıkar ve sonuca user_received_pair_2 ismini ver.
    result.user_received_pair_2 = Math.floor(result.user_received_pair_2_apx - result.payout_additional_fees);

    if (result.user_received_pair_2 < Math.floor(22 * pair_2_coefficient)) {
      errorMessages.push("Dust payout");

      output.assetId = pair_1_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }

    if (result.user_received_pair_2 < (convertion.LE64ToNum(WizData.fromHex(cof.slippageTolerance))?.number || 0)) {
      errorMessages.push("Out of slippage");

      output.assetId = pair_1_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }

    if (errorMessages.length === 0) {
      //SUCCESS
      // İlgili slot için 1 tane settlement output oluştur. Bu outputun asset ID ‘sini pair_2_asset id si olarak ayarla, miktarını da user_received_pair_2 olarak ayarla.
      output = {
        assetId: pair_2_asset_id,
        value: result.user_received_pair_2,
      };

      // pool_pair_1_liquidity değerine user_supply_total değerine ekle ve sonuca new_pool_pair_1_liquidity ismini ver. Bu değeri havuzun güncel pair 1 liquidity miktarı olarak ata.
      result.new_pool_pair_1_liquidity = Math.floor(pool_pair_1_liquidity + result.user_supply_total);

      // pool_pair_2_liquidity değerinden user_received_pair_2 değerini çıkar ve sonuca new_pool_pair_2_liquidity ismini ver. Bu değeri havuzun güncel pair 2 liquidity miktarı olarak ata.
      result.new_pool_pair_2_liquidity = Math.floor(pool_pair_2_liquidity - result.user_received_pair_2);
    }
  } else if (method === "02") {
    console.log(method);

    // 3- Commitment output 2 asset ID’sinin pair_2_asset_id olduğunu kontrol et.
    if (commitmentOutput2AssetId !== pair_2_asset_id) errorMessages.push("Commitment Output 2 AssetId must be equal to pair_1_asset_id");

    // 4- Commitment output 2 miktarına user_supply_total ismini ver.
    result.user_supply_total = new Decimal(commitmentOutput2.value).mul(100000000).toNumber();

    // 5- user_supply_total ‘ı 500’e böl ve bölüm sonucu bir tam sayı olarak ele alıp user_supply_lp_fees ismini ver.
    result.user_supply_lp_fees = Math.floor(result.user_supply_total / 500);

    if (result.user_supply_total > pool_pair_2_liquidity) {
      errorMessages.push("Supply overflow");

      output.assetId = pair_2_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }

    // 6- user_supply_total ’dan user_supply_lp_fees ’ı çıkar ve sonuca user_supply_available ismini ver.
    result.user_supply_available = Math.floor(result.user_supply_total - result.user_supply_lp_fees);

    // 7-pool_pair_2_liquidity ile user_supply_available ’i topla ve sonuca constant_coefficient ismini ver.
    result.constant_coefficient = Math.floor(pool_pair_2_liquidity + result.user_supply_available);

    // 8- constant_coefficient ’ı pair_2_coefficient ’a böl ve bölüm sonucunu bir tam sayı olarak ele alıp constant_coefficient_downgraded ismini ver.
    result.constant_coefficient_downgraded = Math.floor(result.constant_coefficient / pair_2_coefficient);

    // 12- pool_constant değerini constant_coefficient_downgraded ‘e böl ve sonuca new_pair_1_pool_liquidity_apx_1 ismini ver

    result.new_pair_1_pool_liquidity_apx_1 = Math.floor(pool_constant / result.constant_coefficient_downgraded);

    // 13- new_pair_1_pool_liquidity_apx_1 değerini pair_1_coefficient ile çarp ve sonuca new_pair_1_pool_liquidity_apx_2 ismini ver.
    result.new_pair_1_pool_liquidity_apx_2 = Math.floor(result.new_pair_1_pool_liquidity_apx_1 * pair_1_coefficient);

    // 14- pool_pair_1_liquidity değerinden new_pair_1_pool_liquidity_apx_2 değerini çıkar ve sonuca user_received_pair_1_apx ismini ver.
    result.user_received_pair_1_apx = Math.floor(pool_pair_1_liquidity - result.new_pair_1_pool_liquidity_apx_2);

    // 15- pair_1_coefficient değerini 2 ile çarp ve sonuca payout_additional_fees ismini ver.
    result.payout_additional_fees = Math.floor(pair_1_coefficient * 2);

    // 16- user_received_pair_1_apx değerinden payout_additional_fees değerini çıkar ve sonuca user_received_pair_1 ismini ver.
    result.user_received_pair_1 = Math.floor(result.user_received_pair_1_apx - result.payout_additional_fees);

    if (result.user_received_pair_1 < Math.floor(22 * pair_1_coefficient)) {
      errorMessages.push("Dust payout");

      output.assetId = pair_2_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }
    if (result.user_received_pair_1 < (convertion.LE64ToNum(WizData.fromHex(cof.slippageTolerance))?.number || 0)) {
      errorMessages.push("Out of slippage");

      output.assetId = pair_2_asset_id;
      output.value = result.user_supply_total;
      result.new_pool_pair_1_liquidity = pool_pair_1_liquidity;
      result.new_pool_pair_2_liquidity = pool_pair_2_liquidity;
    }

    if (errorMessages.length === 0) {
      //SUCCESS
      // İlgili slot için 1 tane settlement output oluştur. Bu outputun asset ID ‘sini pair_1_asset id si olarak ayarla, miktarını da user_received_pair_1 olarak ayarla.
      output = {
        assetId: pair_1_asset_id,
        value: result.user_received_pair_1,
      };

      // pool_pair_2_liquidity değerine user_supply_total değerine ekle ve sonuca new_pool_pair_2_liquidity ismini ver. Bu değeri havuzun güncel pair 2 liquidity miktarı olarak ata.
      result.new_pool_pair_2_liquidity = Math.floor(pool_pair_2_liquidity + result.user_supply_total);

      // pool_pair_1_liquidity değerinden user_received_pair_1 değerini çıkar ve sonuca new_pool_pair_1_liquidity ismini ver. Bu değeri havuzun güncel pair 1 liquidity miktarı olarak ata.
      result.new_pool_pair_1_liquidity = Math.floor(pool_pair_1_liquidity - result.user_received_pair_1);
    }
  }
  return {
    errorMessages,
    method,
    pool_pair_1_liquidity,
    pool_pair_2_liquidity,
    commitmentOutput2AssetId,
    pair_1_asset_id,
    pair_2_asset_id,
    pair_1_pool_supply,
    pair_2_pool_supply,
    pair_1_coefficient,
    pair_2_coefficient,
    pool_pair_1_liquidity_downgraded,
    pool_pair_2_liquidity_downgraded,
    pool_constant,
    lp_liquidty: poolData.lp.value,
    new_lp_liquidty: poolData.lp.value,
    result,
    txId: "",
  };
};
