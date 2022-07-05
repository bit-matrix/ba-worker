import { TxVInRPC } from "./TxVınRPC";
import { TxVOutRPC } from "./TxVOutRPC";

export type TxDetailRPC = {
  txid: string;
  hash: string;
  wtxid: string;
  withash: string;
  version: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: TxVInRPC[];
  vout: TxVOutRPC[];
};
