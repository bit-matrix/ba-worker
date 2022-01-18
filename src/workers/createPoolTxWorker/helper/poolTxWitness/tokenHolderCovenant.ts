export const tokenHolderCovenant = (poolAssetLE: string, tokenHolderCovenantControlBlockPrefix: string): string => {
  return (
    "" +
    // Number of token holder covenant witness elements (2)
    "02" +
    // Token holder covenant script length
    "25" +
    // Token holder covenant script // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b00c86987
    "20" +
    poolAssetLE +
    "00c86987" +
    // //Token holder covenant control block length
    "21" +
    //Token holder covenant control block prefix // c5
    tokenHolderCovenantControlBlockPrefix +
    //Token holder covenant control block // 1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    //
    "000000"
  );
};
