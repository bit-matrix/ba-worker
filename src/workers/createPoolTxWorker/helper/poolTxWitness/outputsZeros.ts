// // [1 + 2n] byte-length of zeros (n = number of ctxs) // 00000000000000000000000000000000000000000000000000
// (6 + 3*2)*2 + 1 = 25
export const outputsZeros = (n: number): string => {
  const numberOfTxOutputs: number = (6 + n * 2) * 2 + 1;
  const zero = "00";
  let encoded: string = "";
  for (let i = 0; i < numberOfTxOutputs; i++) {
    encoded += zero;
  }
  return encoded;
};
