import { ChangeOutputFinal, SeperatedChangeOutputs, TxDetail, TxVInRPC, TxVOutRPC } from "@bitmatrix/models";
import WizData from "@script-wiz/wiz-data";

export type CTXFinderResult = {
  tapTweakedResultPrefix: string;
  cmtTxLocktimeByteLength: string;
  outputCount: WizData;
  inputCount: WizData;
  inputs: TxVInRPC[];
  outputs: TxVOutRPC[];
  nsequenceValue: string;
  cmtTxInOutpoints: {
    index: number;
    data: string;
  }[];
  cmtOutput1Value: string;
  output2PairValue: string;
  cmtOutput2Value: string;
  cmtOutput3Value?: string;
  cmtOutputFeeHexValue: string;
  cmtOutput3PairValue: string;
  cmtOutput3Asset?: string;
  changeOutputFinal: ChangeOutputFinal[];
  seperatedChangeOutputs: SeperatedChangeOutputs[];
  poolId: string;
  methodCall: string;
  publicKey: string;
  slippageTolerance: string;
  cmtOutput1: TxVOutRPC;
  cmtOutput2: TxVOutRPC;
  cmtOutput3?: TxVOutRPC;
  orderingFee: string;
  transaction: TxDetail;
  pair1Ticker: string;
  pair2Ticker: string;
  lpTicker: string;
};
