export const lpHolderCovenant = (poolAssetLE: string, lpHolderCovenantControlBlockPrefix: string): string => {
  return (
    "" +
    // Number of LP holder covenant witness elements (2)
    "02" +
    // LP holder covenant script length
    "25" +
    // LP holder covenant script // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b00c86987
    "20" +
    poolAssetLE +
    "00c86987" +
    // LP holder covenant control block length
    "21" +
    // LP holder covenant control block prefix // c5
    lpHolderCovenantControlBlockPrefix +
    // LP holder covenant control block // 1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    //
    "000000"
  );
};
