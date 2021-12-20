import { CALL_METHOD } from "../../../business/data/models/BmTx";

export const CALL_METHODS = ["01", "02", "03", "04"];

export const CALL_METHOD_NAME = (callMethod: CALL_METHOD): string => {
  if (callMethod === CALL_METHOD.SWAP_QUOTE_FOR_TOKEN) return "SWAP_QUOTE_FOR_TOKEN";
  if (callMethod === CALL_METHOD.SWAP_TOKEN_FOR_QUOTE) return "SWAP_TOKEN_FOR_QUOTE";
  if (callMethod === CALL_METHOD.ADD_LIQUIDITY) return "ADD_LIQUIDITY";
  if (callMethod === CALL_METHOD.REMOVE_LIQUIDITY) return "REMOVE_LIQUIDITY";
  return "UNKNOWN_CALL_METHOD";
};
