export const TX_INPUT_LENGTH = 2;
export const TX_OUTPUT_LENGTH = 4;
export const CALL_DATA_BYTE_LENGTH = 78;
export const COMMITMENT_SCRIPTPUBKEY_BYTE_LENGTH = 34;

export const PUBLIC_KEY = "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624";

export const LBTC_ASSET_ID = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
// pool’s asset id => t-Tether
export const TOKEN_ASSET_ID = "213cbc4df83abc230852526b1156877f60324da869f0affaee73b6a6a32ad025";
export const LP_ASSET_ID = "01f4346a807134c6dbe20801864d995b9b4c9a73063b0cd806596cd780c0af39";

export const SERVICE_COMMISSION = 650;
export const BASE_FEE = 1200;
export const MIN_REMAINING_SUPPLY = 1000;
export const TOKEN_MIN_VALUE = 50000000;

// // Success path:
// OP_IF // 63
// <0x01000000> // [04] 01000000
// OP_CHECKSEQUENCEVERIFY // b2
// <0> // 00
// OP_INSPECTINPUTASSET // c8
// OP_VERIFY // 69
// <TARGET_FLAG_ASSET_ID> // [20] 807d0fbcae7c4b20518d4d85664f6820aafdf936104122c5073e7744c46c4b87
// OP_EQUAL // 87
//
// // Timeout path:
// OP_ELSE // 67
// <0> // 00
// OP_INSPECTINPUTASSET // c8
// OP_VERIFY // 69
// <TARGET_FLAG_ASSET_ID> // [20] 807d0fbcae7c4b20518d4d85664f6820aafdf936104122c5073e7744c46c4b87
// OP_EQUAL // 87
// OP_NOT // 91
// OP_VERIFY // 69
// <0x3c000000> // [04] 3c000000
// OP_CHECKSEQUENCEVERIFY // b2
// <result_RECIPIENT_PUBLIC_KEY> // [21] result_RECIPIENT_PUBLIC_KEY
// OP_CHECKSIG // ac
// OP_ENDIF // 68

// const COMMITMENT_OUTPUTS_EX = (publicKey: string, targetFlagAssetId: string, recipientPublicKey: string): string => {
/**
 * 630401000000b200c86920 [TARGET_FLAG_ASSET_ID] 876700c86920 [TARGET_FLAG_ASSET_ID] 879169043c000000b221 [result_RECIPIENT_PUBLIC_KEY] ac68
 *  */
// const compiledData = "630401000000b200c86920" + targetFlagAssetId + "876700c86920" + targetFlagAssetId + "879169043c000000b221" + recipientPublicKey + "ac68";
// return tapRootScriptPubKeyHex(publicKey, compiledData);
/*   return "";
}; */

/**
20
TARGET_FLAG_ASSET_ID_REVERSED
766b6b6351b27500c8696c876700c8696c87916960b27521
RECEPIENT_PUBKEY
ac68

example:
20cd7f33bab8a5a73182b2a1542854ba821374a36d9ee3b37ae586e28ceff4a243766b6b6351b27500c8696c876700c8696c87916960b275210253b4443cb73ac1dbe0d0e31c9db5cdce831280fd94ba9c13eb1ea0791819d70eac68

TARGET_FLAG_ASSET_ID_REVERSED = cd7f33bab8a5a73182b2a1542854ba821374a36d9ee3b37ae586e28ceff4a243
PUBKEY = 0253b4443cb73ac1dbe0d0e31c9db5cdce831280fd94ba9c13eb1ea0791819d70e

*/
// export const COMMITMENT_OUTPUTS = (publicKey: string, targetFlagAssetId: string, recipientPublicKey: string): string => {
/**
 *
 * 20 [hexLE(TARGET_FLAG_ASSET_ID)] 766b6b6351b27500c8696c876700c8696c87916960b27521 [RECEPIENT_PUBKEY] ac68
 *
 * */
/*   const compiledData = "20" + hexLE(targetFlagAssetId) + "766b6b6351b27500c8696c876700c8696c87916960b27521" + recipientPublicKey + "ac68";
  return tapRootScriptPubKeyHex(publicKey, compiledData);
}; */
