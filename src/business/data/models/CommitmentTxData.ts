import { CALL_METHOD } from "./CALL_METHOD";

export type CommitmentTxData = {
  CALL_METHOD: CALL_METHOD;
  RECIPIENT_PUBLIC_KEY: string;
  SLIPPAGE_TOLERANCE: string; // number; TODO
  ORDERING_FEE: number; // number; TODO
  SATOSHI_VALUE: number;
  TOKEN_VALUE: number;
  LP_VALUE: number;
};
