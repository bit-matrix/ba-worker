import { BmConfig, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { calcRecipientValue, getRecipientScriptPubkey, getTxFeeServiceCommission, toHex64BE } from "./common";

// tx outputs
export const part2 = (pool: Pool, poolConfig: BmConfig, callData: CallData): string => {
  const poolAssetLE = hexLE(pool.id);
  const tokenAssetLE = hexLE(pool.token.asset);
  const lpAssetLE = hexLE(pool.lp.asset);
  const qouteAssetLE = hexLE(pool.quote.asset);
  const ctxInputValue = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? callData.value.quote : callData.value.token;

  let recipientAssetLE = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? hexLE(pool.token.asset) : hexLE(pool.quote.asset);
  let recipientValueNumber = calcRecipientValue(pool, ctxInputValue, callData.method, poolConfig.recipientValueMinus);
  let poolNewQuoteValue =
    callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? toHex64BE(Number(pool.quote.value) + callData.value.quote) : toHex64BE(Number(pool.quote.value) - recipientValueNumber);
  let poolNewTokenValue =
    callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? toHex64BE(Number(pool.token.value) - recipientValueNumber) : toHex64BE(Number(pool.token.value) + callData.value.token);

  const isOutOfSlippage: boolean = recipientValueNumber < Number(callData.slippageTolerance);
  if (isOutOfSlippage) {
    recipientAssetLE = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? hexLE(pool.quote.asset) : hexLE(pool.token.asset);
    recipientValueNumber = callData.method === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN ? callData.value.quote : callData.value.token;
    poolNewQuoteValue = toHex64BE(Number(pool.quote.value));
    poolNewTokenValue = toHex64BE(Number(pool.token.value));
  }

  const user_token_received_first_half_number: number = Math.floor(recipientValueNumber / 2);
  const user_token_received_second_half_numner: number = recipientValueNumber - user_token_received_first_half_number;

  if (user_token_received_first_half_number < 500) throw new Error("user_token_received_first_half_number is not gte 500");

  const user_token_received_first_half = toHex64BE(user_token_received_first_half_number);
  const user_token_received_second_half = toHex64BE(user_token_received_second_half_numner);

  const poolNewLPValue = toHex64BE(Number(pool.lp.value));
  const recipientScriptPubkey = getRecipientScriptPubkey(callData.recipientPublicKey);
  const { txFee, serviceCommission } = getTxFeeServiceCommission(poolConfig.baseFee.number, poolConfig.serviceFee.number, callData.orderingFee); //  438, 1452   ???
  const tokenHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.token;
  const lpHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.lp;
  const mainHolderCovenantScriptPubkey: string = poolConfig.holderCovenant.scriptpubkey.main;

  const p2 =
    "08" +
    "01" +
    poolAssetLE +
    "01" +
    "0000000000000001" +
    "00" +
    "22" +
    "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55" +
    "01" +
    tokenAssetLE + // "9ea16a72a9c0b3426fff559b42452ca9272dc783f4bce7ef6b9c834624a3ca58" +
    "01" +
    poolNewTokenValue + // 0000000b95828840 // POOL_NEW_TOKEN_VALUE
    "00" +
    "22" +
    tokenHolderCovenantScriptPubkey + // "5120600f3c5efcfe1cb0bd7039af754347255d4146a1b32ed603bc1021f23b85a6d7" +
    "01" +
    lpAssetLE + // "f4a047bf48db3905b941878c9f597cb617c33f5bf783a4c2cd26548a2d8f2c77" +
    "01" +
    poolNewLPValue + // "0000000077356cf0" +
    "00" +
    "22" +
    lpHolderCovenantScriptPubkey + // "5120600f3c5efcfe1cb0bd7039af754347255d4146a1b32ed603bc1021f23b85a6d7" +
    "01" +
    qouteAssetLE + // "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    poolNewQuoteValue + // 00000000000f55c8 // POOL_NEW_LBTC_VALUE
    "00" +
    "22" +
    mainHolderCovenantScriptPubkey + // "5120cffae0ae0d452200dd3566085d44887df51f55a2641f775ed1f32954a4506b36" +
    "01" +
    recipientAssetLE + // "RECEPIENT_ASSET_ID_REVERSE (L-BTC or TOKEN)" // 25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21
    "01" +
    user_token_received_first_half + // "RECEPIENT_VALUE" // 000000000eb8ebc0
    "00" +
    "16" +
    recipientScriptPubkey + // "RECEPIENT_SCRIPTPUBKEY" // 002062b5685478a2648d2d2eac4588fd5e8b51d9bdc34ebf942aa3310575a6227d52
    // new
    "01" +
    recipientAssetLE + // "RECEPIENT_ASSET_ID_REVERSE (L-BTC or TOKEN)" // 25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21
    "01" +
    user_token_received_second_half + // "RECEPIENT_VALUE" // 000000000eb8ebc0
    "00" +
    "16" +
    recipientScriptPubkey +
    // "01" +
    // qouteAssetLE + // "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    // "01" +
    // "0000000000000000" +
    // "00" +
    // "03" +
    // "6a01ff" +
    // new
    "01" +
    qouteAssetLE + // "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    serviceCommission + // "_SERVICE_COMISSION_"  // 00000000000005ac
    "00" +
    "16" +
    "0014972ca4efa6bac21a771259e77dafabeeb0acbfe0" +
    "01" +
    qouteAssetLE + // "499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c14" +
    "01" +
    txFee + // "_TX_FEE_" // 00000000000001b6
    "00" +
    "00" +
    "00000000";

  // console.log("Output hex: " + p2);
  return p2;
};
