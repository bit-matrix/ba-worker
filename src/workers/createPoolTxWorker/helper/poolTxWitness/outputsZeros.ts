// // [1 + 2n] byte-length of zeros (n = number of tx outputs) // 00000000000000000000000000000000000000000000000000
// 1 + 2*12 = 25
export const outputsZeros = (n: number): string => {
  const byteCount: number = 1 + 2 * n;
  const zero = "00";
  let encoded: string = "";
  for (let i = 0; i < byteCount; i++) {
    encoded += zero;
  }
  return encoded;
};
