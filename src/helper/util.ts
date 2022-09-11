import { getAssetWithBlockstream } from "./getAsset";
import { arithmetics64 } from "@script-wiz/lib-core";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { LBTC_ASSET } from "../env";

const onlyUnique = (value: Array<any>, index: number, self: any) => {
  return self.indexOf(value) === index;
};

export const isUniqueArray = (array: Array<any>): boolean => {
  var uniqueArray = array.filter(onlyUnique);

  return array.length === uniqueArray.length;
};

export const div = (input1: number, input2: number) => Math.floor(input1 / input2);

export const tickerFinder = async (asset: string): Promise<{ ticker: string; name: string; precision: number }> => {
  if (asset === LBTC_ASSET) {
    return { ticker: "tL-BTC", name: "Liquid Bitcoin", precision: 8 };
  } else {
    const bsAsset = await getAssetWithBlockstream(asset);

    return { ticker: bsAsset.ticker || asset.slice(0, 4), name: bsAsset.name || "Unknown", precision: bsAsset.precision || 8 };
  }
};

export const deepCopy = <T>(original: T): T => {
  return JSON.parse(JSON.stringify(original));
};

export const replaceChar = (text: string, index: number, replacement: string) => {
  if (index >= text.length) {
    return text.valueOf();
  }

  var chars = text.split("");
  chars[index] = replacement;
  return chars.join("");
};

export const lexicographical = (aTxid: string, bTxid: string): number => {
  if (aTxid.length !== 64 || bTxid.length !== 64) throw new Error("Lexicographical error. Wrong length tx ids: " + aTxid + "," + bTxid);
  const a = hexLE(aTxid.substring(48));
  const b = hexLE(bTxid.substring(48));

  if (a === b) return 0;

  return arithmetics64.greaterThan64(WizData.fromHex(b), WizData.fromHex(a)).number === 1 ? 1 : -1;
};

export const hexToNum = (hex: string) => {
  return parseInt(hexLE(hex), 16);
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
