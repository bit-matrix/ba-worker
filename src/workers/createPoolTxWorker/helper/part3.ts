import { esploraClient } from "@bitmatrix/esplora-api-client";
import { BmConfig, BmCtxNew, CallData, CALL_METHOD, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { getRecepientScriptPubkey, getTxFeeServiceCommission, splitCommitmentTxBaseHex, toHex64BE } from "./common";

// tx outputs
export const part3 = async (pool: Pool, poolConfig: BmConfig, ctx: BmCtxNew): Promise<string> => {
  const txHex = await esploraClient.txHex(ctx.commitmentTx.txid);
  const settlement = await splitCommitmentTxBaseHex(txHex);
  console.log("settlement", settlement);
  const tapscript = ctx.output.compiledData;
  const tapscriptPrefix = ctx.output.tweakPrefix;

  const p3 =
    "000002" +
    "34cd008800c7010088040000000088767651c70100880401000000888852c70100880402000000888853c701008804030000008887" +
    "21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "00000002" +
    "2520165cba5c638bab5a923eed64abbfbf7e2b2e932fc308f00804f934bef434ede100c86987" +
    "21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "00000002" +
    "2520165cba5c638bab5a923eed64abbfbf7e2b2e932fc308f00804f934bef434ede100c86987" +
    "21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "00000009" +
    "0103" +
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
    "fda904" +
    "7e7e7e7e7e7c20165cba5c638bab5a923eed64abbfbf7e2b2e932fc308f00804f934bef434ede11b20766b6b6351b27500c8696c876700c8696c87916960b27521ac68201dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624105461704c6561662f656c656d656e747311546170547765616b2f656c656d656e747300c869557988cd5388d45688d5588853c9696b51c9696b52c9696b006b04ffffff7f6b567a766e6e6eaa7654c70100880401000000888855c7010088040200000088888202a201885180528855517f5288012a557f0500ffffffff880153557f0500ffffffff880158517f5488028400547f04516a4c4e88028800014e7f76012080567988760120517f7c76012101217f7c760142587f7c014a547fe2e1577976518000c8697e51795101187f7e54797e7c0119527f7e5679a8767e01c47e015c7e7c7ea85579a8767e58797e7c7ea85a7a54ca697654ca69887e7c5879e46c6c5279936b51797651a2696ea0636d678854c76d588052c76d5880dd6968527aa954d100888854c86953c869886c6c6c6c00cb54cb88567a765487916355ce6953ce698855cf690800000000000000008855d14f88036a01FFa88868765187637554c96902b004567993e0d8697602e803e0df69766b55c86953c8698855c969028a02e0887602f401e0da6977d8695179d76960e0da6977517960e0da697753790380841ee0da6977d9697cda69770380841ee0d96952797cd8690340420fe0d869567a5179dd637654ce6951c8698854cf69887c6cd769527a527ad8697c6754ce6953c869886c54cf6988756867765287637554c96902b0045679028a029393e08855c86951c8698855c969760480f0fa02e0df69766b7602f401e0da6977d8695279d7690380841ee0da6977517960e0da697753790380841ee0da6977d9697cda697760e0d96951797cd869567a5179dd637654ce6953c8698854cf6988d869517a6cd7697c6754ce6951c869886c54cf6988756867765387637554c96902b0045679028a029393e0d8697602e803e0df697660e0da69770400943577e05579d869766bd969527960e0da6977da697755c86951c8698855c969760480f0fa02e0df69760380841ee0da69776cd96955790380841ee0da6977da6977527a6edf637767756852c86954ce69887654cf6988557a7cd869547a527ad769537a537ad769557a7567765487637554c96902b0045679028a029393e08855c86952c8698855c969766b517960e0da6977d9690400943577e05479d869766bda697760e0d9697654cf69886c6c766b54790380841ee0da6977d9697cda69770380841ee0d9697655ce6951ce698855cf69886c557ad769547a527ad869537a537ad869557a75676a686868686b6b6b6b6b6d6d756c756ce051e002b004e0d969d76953e0da69777652e0d96951e0d9690120e0da6977d769d58c767676cf69547a88d14f8800a888ce6953ce69888c76d1008814972ca4efa6bac21a771259e77dafabeeb0acbfe088ce6953ce69886c52cf69886c51cf69886c53cf698800ca6900d1698851ca6951d1698852ca6952d1698853ca6953d1698800c86900ce698851c86951ce698852c86952ce698853c86953ce6988d2040200000088d3040000000087" +
    "21c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "00000003" +
    "0101" +
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 5c20cd7f33bab8a5a73182b2a1542854ba821374a36d9ee3b37ae586e28ceff4a243766b6b6351b27500c8696c876700c8696c87916960b275210253b4443cb73ac1dbe0d0e31c9db5cdce831280fd94ba9c13eb1ea0791819d70eac68
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "00000003" +
    "0101" +
    "5c" +
    tapscript + // COMMITMENT_OUTPUT_TAPSCRIPT // 5c20cd7f33bab8a5a73182b2a1542854ba821374a36d9ee3b37ae586e28ceff4a243766b6b6351b27500c8696c876700c8696c87916960b275210253b4443cb73ac1dbe0d0e31c9db5cdce831280fd94ba9c13eb1ea0791819d70eac68
    "21" +
    tapscriptPrefix + // c4-c5 // c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624" +
    "0000000000000000000000000000000000";

  console.log("witness data", p3);
  return p3;
};
