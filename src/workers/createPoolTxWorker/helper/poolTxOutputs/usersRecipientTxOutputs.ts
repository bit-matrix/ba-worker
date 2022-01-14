const userRecipientTxOutputs = (
  userRecipientScriptPubkey: string,
  userRecipientAssetLE1: string,
  userRecipientValueHex1: string,
  userRecipientAssetLE2: string,
  userRecipientValueHex2: string
): string => {
  const userRecipientTxOutputsEncoded: string =
    // #4 output: User received 1 - quote
    "01" +
    userRecipientAssetLE1 + // "RECEPIENT_ASSET_ID_REVERSE (L-BTC or TOKEN)" // 25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21
    "01" +
    userRecipientValueHex1 + // "RECEPIENT_VALUE" // 000000000eb8ebc0
    "00" +
    "16" +
    userRecipientScriptPubkey + // "RECEPIENT_SCRIPTPUBKEY" // 002062b5685478a2648d2d2eac4588fd5e8b51d9bdc34ebf942aa3310575a6227d52
    // #5 output: User received 2 - token
    "01" +
    userRecipientAssetLE2 + // "RECEPIENT_ASSET_ID_REVERSE (L-BTC or TOKEN)" // 25d02aa3a6b673eefaaff069a84d32607f8756116b52520823bc3af84dbc3c21
    "01" +
    userRecipientValueHex2 + // "RECEPIENT_VALUE" // 000000000eb8ebc0
    "00" +
    "16" +
    userRecipientScriptPubkey; // "RECEPIENT_SCRIPTPUBKEY" // 002062b5685478a2648d2d2eac4588fd5e8b51d9bdc34ebf942aa3310575a6227d52

  return userRecipientTxOutputsEncoded;
};

export const usersRecipientTxOutputs = (
  userRecipients: {
    scriptPubkey: string;
    assetLE1: string;
    valueHex1: string;
    assetLE2: string;
    valueHex2: string;
  }[]
): string => {
  const usersRecipientTxOutputsEncoded = userRecipients.reduce(
    (previous, current) => previous + userRecipientTxOutputs(current.scriptPubkey, current.assetLE1, current.valueHex1, current.assetLE2, current.valueHex2),
    ""
  );

  return usersRecipientTxOutputsEncoded;
};
