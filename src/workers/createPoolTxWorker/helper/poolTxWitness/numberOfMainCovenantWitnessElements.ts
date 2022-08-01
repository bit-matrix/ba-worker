// Number of main covenant witness elements (23 = 2 + 7n [n = number of leafs]) // 17
export const numberOfMainCovenantWitnessElements = (numberOfLeafs: number): string => {
  return (2 + 7 * numberOfLeafs).toString(16).padStart(2, "0");
};
