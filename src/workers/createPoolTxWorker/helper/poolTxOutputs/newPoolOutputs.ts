import { BmConfig, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";

// new pool outputs
export const newPoolOutputs = (
  poolAssetLE: string,
  tokenAssetLE: string,
  lpAssetLE: string,
  qouteAssetLE: string,

  tokenHolderCovenantScriptPubkey: string,
  lpHolderCovenantScriptPubkey: string,
  mainHolderCovenantScriptPubkey: string,

  newPoolTokenValueHex: string,
  newPoolLpValueHex: string,
  newPoolQuoteValueHex: string
): string => {
  const newPoolOutputsEncoded =
    // #0 output: NFT
    "01" +
    poolAssetLE +
    "01" +
    "0000000000000001" +
    "00" +
    "22" +
    "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55" +
    // #1 output: Pool token
    "01" +
    tokenAssetLE +
    "01" +
    newPoolTokenValueHex +
    "00" +
    "22" +
    tokenHolderCovenantScriptPubkey +
    // #2 output: Pool lp
    "01" +
    lpAssetLE +
    "01" +
    newPoolLpValueHex +
    "00" +
    "22" +
    lpHolderCovenantScriptPubkey +
    // #3 output: Pool quote
    "01" +
    qouteAssetLE +
    "01" +
    newPoolQuoteValueHex +
    "00" +
    "22" +
    mainHolderCovenantScriptPubkey;

  return newPoolOutputsEncoded;
};
