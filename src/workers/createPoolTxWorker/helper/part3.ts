import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { getRecipientScriptPubkey, getTxFeeServiceCommission, splitCommitmentTxBaseHex, toHex64BE } from "./common";

// tx outputs
export const part3 = async (pool: Pool, poolConfig: BmConfig, ctx: BmCtxNew): Promise<string> => {
  const poolAssetLE = hexLE(pool.id);

  const txHex = await esploraClient.txHex(ctx.commitmentTx.txid);
  const settlement = await splitCommitmentTxBaseHex(txHex);
  // console.log("settlement", settlement);
  const tapscript = ctx.output.compiledData;
  const tapscriptPrefix = ctx.output.tweakPrefix;
  const tapscriptPrefixBase = tapscriptPrefix === "c4" ? "02" : "03";

  const tokenHolderCovenantControlBlockPrefix: string = poolConfig.holderCovenant.controlBlockPrefix.token;
  const lpHolderCovenantControlBlockPrefix: string = poolConfig.holderCovenant.controlBlockPrefix.lp;
  const mainHolderCovenantControlBlockPrefix: string = poolConfig.holderCovenant.controlBlockPrefix.main;

  let mainCovenantScript = poolConfig.mainCovenantScript;
  const p3 =
    //
    "0000" +
    /**
     *
     *
     *
     */
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
    "000000" +
    /**
     *
     *
     *
     */
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
    "000000" +
    /**
     *
     *
     *
     */
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
    "000000" +
    /**
     *
     *
     *
     */
    // Number of main covenant witness elements (23 = 2 + 7n [n = number of leafs]) // 17
    "09" +
    /**
     *
     */

    // Commitment tx 3 commitment output tapscript prefix // 0102
    // tapscriptPrefixBase lenght
    "01" +
    tapscriptPrefixBase +
    // Commitment tx 1 base-serialization in 5 settlements
    "50" +
    settlement[0] + // 1ST_SETTLEMENT //
    "50" +
    settlement[1] + // 2ND_SETTLEMENT //
    "50" +
    settlement[2] + // 3RD_SETTLEMENT //
    "50" +
    settlement[3] + // 4TH_SETTLEMENT //
    "50" +
    settlement[4] + // 5TH_SETTLEMENT //
    "12" +
    settlement[5] + // 6TH_SETTLEMENT //
    //
    // Commitment tx 2 commitment output tapscript prefix // 0102
    // tapscriptPrefixBase lenght
    "01" +
    tapscriptPrefixBase +
    // Commitment tx 1 base-serialization in 5 settlements
    "50" +
    settlement[0] + // 1ST_SETTLEMENT //
    "50" +
    settlement[1] + // 2ND_SETTLEMENT //
    "50" +
    settlement[2] + // 3RD_SETTLEMENT //
    "50" +
    settlement[3] + // 4TH_SETTLEMENT //
    "50" +
    settlement[4] + // 5TH_SETTLEMENT //
    "12" +
    settlement[5] + // 6TH_SETTLEMENT //
    //
    // Commitment tx 1
    // Commitment tx 1 commitment output tapscript prefix // 0102
    // tapscriptPrefixBase lenght
    "01" +
    tapscriptPrefixBase +
    // Commitment tx 1 base-serialization in 5 settlements
    "50" +
    settlement[0] + // 1ST_SETTLEMENT //
    "50" +
    settlement[1] + // 2ND_SETTLEMENT //
    "50" +
    settlement[2] + // 3RD_SETTLEMENT //
    "50" +
    settlement[3] + // 4TH_SETTLEMENT //
    "50" +
    settlement[4] + // 5TH_SETTLEMENT //
    "12" +
    settlement[5] + // 6TH_SETTLEMENT //
    /**
     *
     *
     *
     *
     */
    // Main covenant script length (bitcoin compact size) // fde10b
    // Main covenant script // 7e7e7e7e7e7c6b6b7e7e7e7e7e7c6c6c6b6b6b6b7e7e7e7e7e7c6c6c6c6c20853..........40200000088d3040000000087
    // Main covenant control block length // 61
    // Main covenant control block // c51dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f6242eb85591c0492f8255573dfe4ca1dbbc774f2969b48e520abd0f40155d1c92b2e1a75c66947ba402c174685f445b91a83dac3f0e34c579c76ea6d4cbcaac131e
    mainCovenantScript +
    /*
     *
     *
     *
     *
     */
    // Commitment tx1
    // Commitment tx1 commitment input 1 witness
    "00000003" +
    "0101" +
    // tapscript lenght
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b766b6b6351b27500c8696c876700c8696c87916960b2752103099e94a959aaa0bcdacea9559a7ef16f7e9bd32a72d7bb6be3cee3de39161ff9ac68
    // 21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    //
    //Commitment tx1 commitment input 2 witness
    "00000003" +
    "0101" +
    // tapscript lenght
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b766b6b6351b27500c8696c876700c8696c87916960b2752103099e94a959aaa0bcdacea9559a7ef16f7e9bd32a72d7bb6be3cee3de39161ff9ac68
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    // Commitment tx2
    // Commitment tx2 commitment input 1 witness
    "00000003" +
    "0101" +
    // tapscript lenght
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b766b6b6351b27500c8696c876700c8696c87916960b2752103099e94a959aaa0bcdacea9559a7ef16f7e9bd32a72d7bb6be3cee3de39161ff9ac68
    // 21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    //
    //Commitment tx2 commitment input 2 witness
    "00000003" +
    "0101" +
    // tapscript lenght
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 2085356e5c5e5e5f62aca887aff1617b68b82582c997620cd51fbb117a958ec40b766b6b6351b27500c8696c876700c8696c87916960b2752103099e94a959aaa0bcdacea9559a7ef16f7e9bd32a72d7bb6be3cee3de39161ff9ac68
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    /**
     *
     */
    // // [1 + 2n] byte-length of zeros (n = number of tx outputs) // 00000000000000000000000000000000000000000000000000
    // 1 + 2*12 = 25

    "0000000000000000000000000000000000";

  // console.log("witness data", p3);
  return p3;
};
