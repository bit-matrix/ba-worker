// import { COMMITMENT_OUTPUTS, PUBLIC_KEY } from "../../../const";

export const checkTweakedPubkey = (assetId: string) => {
  //, btxc: BitmatrixTxCommitment) => {
  try {
    // const tapRootScriptPubKeyHexValue: string = COMMITMENT_OUTPUTS(PUBLIC_KEY, assetId, btxc.stepData0.RECIPIENT_PUBLIC_KEY);
    // if (btxc.tx.vout[1].scriptpubkey !== tapRootScriptPubKeyHexValue) throw new Error("commitment txouts' scriptpubkey is diffirent from tweaked pubkey");
  } catch (err) {
    throw err;
  }
};
