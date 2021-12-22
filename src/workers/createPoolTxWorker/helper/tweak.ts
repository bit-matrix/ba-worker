import WizData from "@script-wiz/wiz-data";
import { crypto } from "@script-wiz/lib-core";
import bcrypto from "bcrypto";

const toHexString = (byteArray: Uint8Array) => {
  return Array.from(byteArray, function (byte) {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
};

const tweakAdd = (pubkey: WizData, tweak: WizData): WizData => {
  if (pubkey.bytes.length !== 32) throw "Pubkey length must be equal 32 byte";

  const tweaked = WizData.fromHex(bcrypto.schnorr.publicKeyTweakAdd(Buffer.from(pubkey.hex, "hex"), Buffer.from(tweak.hex, "hex")).toString("hex"));
  return publicKeyTweakCheck(pubkey, tweak, tweaked);
};

const publicKeyTweakCheck = (pubkey: WizData, tweak: WizData, expect: WizData): WizData => {
  if (pubkey.bytes.length !== 32) throw "Pubkey length must be equal 32 byte";

  const isNegate = bcrypto.schnorr.publicKeyTweakCheck(Buffer.from(pubkey.hex, "hex"), Buffer.from(tweak.hex, "hex"), Buffer.from(expect.hex, "hex"), true);

  if (isNegate) return WizData.fromHex("03" + expect.hex);

  return WizData.fromHex("02" + expect.hex);
};

const tagHash = (tag: string, data: WizData) => {
  let hashedTag = crypto.sha256v2(WizData.fromText(tag));
  hashedTag = hashedTag.concat(hashedTag);
  hashedTag = hashedTag.concat(toHexString(data.bytes));
  return crypto.sha256v2(WizData.fromHex(hashedTag));
};

const treeHelper = (scripts: WizData[], version: string): string => {
  let treeHelperResultHex = "";
  const leaftag = "TapLeaf/elements";
  // const tapBranchtag = version === "c4" ? "TapBranch/elements" : "TapBranch";

  scripts.forEach((script) => {
    const scriptLength = WizData.fromNumber(script.hex.length / 2).hex;
    const scriptData = version + scriptLength + script.hex;
    const h = tagHash(leaftag, WizData.fromHex(scriptData));
    treeHelperResultHex += h;
  });

  // multi leaf
  // const tapBranchResult: string = tagHash(tapBranchtag, WizData.fromHex(treeHelperResultHex));
  return treeHelperResultHex;
};

export const tapRootScriptPubKeyHex = (publicKey: string, scriptByteData: string) => {
  const pubKey = WizData.fromHex(publicKey);
  const scripts = [WizData.fromHex(scriptByteData)];

  const version = "c4";
  const tag = "TapTweak/elements";

  const h: string = treeHelper(scripts, version);
  // console.log("tap leaf result", h);

  const tweak = tagHash(tag, WizData.fromHex(pubKey.hex + h));
  // console.log("tap tweak result", tweak);

  const tweaked = tweakAdd(pubKey, WizData.fromHex(tweak));
  // console.log("tap tweaked result:", tweaked.hex);

  const finalTweaked = tweaked.hex.substring(2);
  // console.log("final tweaked", finalTweaked);

  const scriptPubKey = WizData.fromHex("51" + WizData.fromNumber(finalTweaked.length / 2).hex + finalTweaked);
  return { scriptPubKey: scriptPubKey.hex, prefix: tweaked.hex.substring(0, 2) === "02" ? "c4" : "c5" };
};
