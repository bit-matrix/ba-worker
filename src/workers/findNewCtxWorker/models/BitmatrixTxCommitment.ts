import { TxDetail } from "@bitmatrix/esplora-api-client";
import { STEP_0_DATA } from "./STEP_0_DATA";
import { STEP_1_DATA } from "./STEP_1_DATA";

export interface BitmatrixTxCommitment {
  tx: TxDetail;
  stepData0: STEP_0_DATA;
  stepData1: STEP_1_DATA;
}
