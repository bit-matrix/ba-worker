import { BN } from "bn.js";

const MAX_INTEGER_64 = new BN("7fffffffffffffff", "hex");
const MAX_INTEGER_32 = new BN("7fffffff", "hex");
const BN_ONE = new BN(1);

export const positiveNumber64 = (leString: string, errMessage: string): string => {
  const inputNumber = new BN(leString, "hex", "le");
  if (inputNumber.gte(BN_ONE) && inputNumber.lte(MAX_INTEGER_64)) return inputNumber.toString();
  throw new Error(errMessage);
};

export const positiveNumber32 = (leString: string, errMessage: string): number => {
  const inputNumber = new BN(leString, "hex", "le");
  if (inputNumber.gte(BN_ONE) && inputNumber.lte(MAX_INTEGER_32)) return inputNumber.toNumber();
  throw new Error(errMessage);
};
