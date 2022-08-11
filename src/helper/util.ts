const onlyUnique = (value: Array<any>, index: number, self: any) => {
  return self.indexOf(value) === index;
};

export const isUniqueArray = (array: Array<any>): boolean => {
  var uniqueArray = array.filter(onlyUnique);

  return array.length === uniqueArray.length;
};

export const div = (input1: number, input2: number) => Math.floor(input1 / input2);

export const lbtcAsset = "144c654344aa716d6f3abcc1ca90e5641e4e2a7f633bc09fe3baf64585819a49";
export const usdtAsset = "f3d1ec678811398cd2ae277cbe3849c6f6dbd72c74bc542f7c4b11ff0e820958";
export const cadAsset = "ac3e0ff248c5051ffd61e00155b7122e5ebc04fd397a0ecbdd4f4e4a56232926";

export const tickerFinder = (asset: string): { ticker: string; name: string } => {
  if (asset === lbtcAsset) {
    return { ticker: "tL-BTC", name: "Liquid Bitcoin" };
  } else if (asset === usdtAsset) {
    return { ticker: "tL-USDt", name: "Liquid Tether" };
  } else if (asset === cadAsset) {
    return { ticker: "LCAD", name: "Liquid Canadian Dollar" };
  }

  return { ticker: asset.slice(0, 4), name: "unknown" };
};

export const deepCopy = <T>(original: T): T => {
  return JSON.parse(JSON.stringify(original));
};
