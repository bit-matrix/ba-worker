import { CALL_METHOD } from "../../../business/data/models/CALL_METHOD";

export interface STEP_0_DATA {
  CALL_METHOD: CALL_METHOD;
  RECIPIENT_PUBLIC_KEY: string;
  SLIPPAGE_TOLERANCE: string; // number; TODO
  ORDERING_FEE: number; // number; TODO
}
