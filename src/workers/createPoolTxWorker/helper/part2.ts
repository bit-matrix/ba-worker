import { BmConfig, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { calc1, getRecepientScriptPubkey, getTxFeeServiceCommission, toHex64BE } from "./common";

// tx outputs
export const part2 = (pool: Pool, poolConfig: BmConfig, callData: CallData): string => {
  const poolAssetLE = hexLE(pool.id);

  const recepientAssetLE = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? hexLE(pool.token.asset) : hexLE(pool.quote.asset);

  const c1 = calc1(pool, callData.value.quote);
  const recepientValue = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? toHex64BE(c1) : hexLE(callData.value.token.toString());
  const recepientScriptPubkey = getRecepientScriptPubkey(callData.recipientPublicKey);

  const { txFee, serviceCommission } = getTxFeeServiceCommission(poolConfig.baseFee.number, poolConfig.serviceFee.number, callData.orderingFee); //  438, 1452   ???

  const poolNewQuoteValue = toHex64BE(Number(pool.quote.value) + callData.value.quote);
  const poolNewTokenValue = toHex64BE(Number(pool.token.value) - c1);

  console.log("c1", c1);
  console.log("recepientValue", recepientValue);
  console.log("txFee, serviceCommission", txFee, serviceCommission);
  console.log("poolNewTokenValue", Number(pool.token.value) - c1, poolNewTokenValue);
  console.log("poolNewQuoteValue", Number(pool.quote.value) + callData.value.quote, poolNewQuoteValue);

  console.log(
    "Output params: poolAssetLE=" +
      poolAssetLE +
      ", poolNewTokenValue=" +
      poolNewTokenValue +
      ", poolNewQuoteValue=" +
      poolNewQuoteValue +
      ", recepientAssetLE=" +
      recepientAssetLE +
      ", recepientValue=" +
      recepientValue +
      ", recepientScriptPubkey=" +
      recepientScriptPubkey +
      ", serviceCommission=" +
      serviceCommission +
      ", txFee=" +
      txFee
  );

  const p2 =
    "08" +
    "01" +
    poolAssetLE +
    "01" +
    "0000000000000001" +
    "00" +
    "22" +
    "5120b73b298773dd2bb55b4411f7ee2882a41bbe83c7cf678937421ca2e3ef39d2ea" +
    "01" +
    "25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21" +
    "01" +
    poolNewTokenValue + // 0000000b95828840 // POOL_NEW_TOKEN_VALUE
    "00" +
    "22" +
    "5120b73b298773dd2bb55b4411f7ee2882a41bbe83c7cf678937421ca2e3ef39d2ea" +
    "01" +
    "39afc080d76c5906d80c3b06739a4c9b5b994d860108e2dbc63471806a34f401" +
    "01" +
    "0000000077356cf0" +
    "00" +
    "22" +
    "5120b73b298773dd2bb55b4411f7ee2882a41bbe83c7cf678937421ca2e3ef39d2ea" +
    "01" +
    "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    poolNewQuoteValue + // 00000000000f55c8 // POOL_NEW_LBTC_VALUE
    "00" +
    "22" +
    "512021c31367d75854531dc45bbab54ed046c81e110f1668713aab9775464cd156d5" +
    "01" +
    recepientAssetLE + // "RECEPIENT_ASSET_ID_REVERSE (L-BTC or TOKEN)" // 25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21
    "01" +
    recepientValue + // "RECEPIENT_VALUE" // 000000000eb8ebc0
    "00" +
    "22" +
    recepientScriptPubkey + // "RECEPIENT_SCRIPTPUBKEY" // 002062b5685478a2648d2d2eac4588fd5e8b51d9bdc34ebf942aa3310575a6227d52
    "01" +
    "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    "0000000000000000" +
    "00" +
    "03" +
    "6a01ff" +
    "01" +
    "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    serviceCommission + // "_SERVICE_COMISSION_"  // 00000000000005ac
    "00" +
    "16" +
    "00141ef08948ed902a517d90ef6955c66c183a444afd" +
    "01" +
    "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    txFee + // "_TX_FEE_" // 00000000000001b6
    "00" +
    "00" +
    "00000000";

  console.log("Output hex: " + p2);
  return p2;
};
