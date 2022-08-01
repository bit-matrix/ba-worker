export const flagCovenant = (mainHolderCovenantControlBlockPrefix = "c4" || "c5"): string => {
  return (
    "" +
    // Number of flag covenant witness elements (2)
    "02" +
    // Flag covenant script length
    "34" +
    // Flag covenant script // cd008800c7010088040000000088767651c70100880401000000888852c70100880402000000888853c701008804030000008887
    "cd008800c7010088040000000088767651c70100880401000000888852c70100880402000000888853c701008804030000008887" +
    // Flag covenant control block length
    "21" +
    // Flag covenant control block prefix // c4
    mainHolderCovenantControlBlockPrefix +
    // Flag covenant control block // 1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    //
    "000000"
  );
};
