import { Aggregator, CTXFinderResult, PTXFinderResult } from "@bitmatrix/models";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { convertion, taproot, TAPROOT_VERSION, utils } from "@script-wiz/lib-core";
import { api, commitmentOutput, pool } from "@bitmatrix/lib";

export const broadcastPoolTx = async (commitmentData: CTXFinderResult, poolValidationData: PTXFinderResult): Promise<string> => {
  // will be implemented in the future

  // ------------- INPUTS START -------------
  const inputCountForInput = commitmentData.methodCall === "03" ? WizData.fromNumber(7) : WizData.fromNumber(6);

  const version = "02000000";
  const const1 = "01";

  let input1 = "";
  let input2 = "";
  let input3 = "";
  let input4 = "";

  input1 = hexLE(poolValidationData.poolData.lastStateTxId) + convertion.convert32(WizData.fromNumber(0)).hex + "00" + "01000000";
  input2 = hexLE(poolValidationData.poolData.lastStateTxId) + convertion.convert32(WizData.fromNumber(1)).hex + "00" + "01000000";
  input3 = hexLE(poolValidationData.poolData.lastStateTxId) + convertion.convert32(WizData.fromNumber(2)).hex + "00" + "01000000";
  input4 = hexLE(poolValidationData.poolData.lastStateTxId) + convertion.convert32(WizData.fromNumber(3)).hex + "00" + "01000000";

  // @todo for loop for waiting ctx
  const input5 = hexLE(commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(commitmentData.cmtOutput1.n)).hex + "00" + "01000000";
  const input6 = hexLE(commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(commitmentData.cmtOutput2.n)).hex + "00" + "01000000";

  let inputs = input1 + input2 + input3 + input4 + input5 + input6;

  if (commitmentData.cmtOutput3) {
    const input7 = hexLE(commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(commitmentData.cmtOutput3.n)).hex + "00" + "01000000";
    inputs = inputs + input7;
  }

  const inputTemplate = version + const1 + inputCountForInput.hex + inputs;

  // ------------- INPUTS END -------------

  // ------------- OUTPUTS START -------------

  const script = [WizData.fromHex("20" + hexLE(commitmentData.poolId) + "00c86987")];
  const pubkey = WizData.fromHex("1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624");

  // leaf count and current index temp
  const poolMainCovenant = pool.createCovenants(0, 0, commitmentData.poolId, poolValidationData.pair_1_coefficient);

  const flagCovenantScriptPubkey = "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55";
  const tokenCovenantScriptPubkey = taproot.tapRoot(pubkey, script, TAPROOT_VERSION.LIQUID).scriptPubkey.hex;
  const lpHolderCovenantScriptPubkey = tokenCovenantScriptPubkey;
  const poolMainCovenantScriptPubkey = poolMainCovenant.taprootResult.scriptPubkey.hex;

  const output1 = "01" + hexLE(commitmentData.poolId) + "01" + "0000000000000001" + "00" + utils.compactSizeVarInt(flagCovenantScriptPubkey) + flagCovenantScriptPubkey;
  const output2 =
    "01" +
    hexLE(poolValidationData.pair_2_asset_id) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(poolValidationData.result.new_pool_pair_2_liquidity)).hex +
    "00" +
    utils.compactSizeVarInt(tokenCovenantScriptPubkey) +
    tokenCovenantScriptPubkey;
  const output3 =
    "01" +
    hexLE(poolValidationData.lp_asset_id) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(commitmentData.methodCall === "03" ? poolValidationData.result.new_pool_lp_supply : poolValidationData.result.new_pool_lp_liquidity))
      .hex +
    "00" +
    utils.compactSizeVarInt(lpHolderCovenantScriptPubkey) +
    lpHolderCovenantScriptPubkey;
  const output4 =
    "01" +
    hexLE(poolValidationData.pair_1_asset_id) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(poolValidationData.result.new_pool_pair_1_liquidity)).hex +
    "00" +
    utils.compactSizeVarInt(poolMainCovenantScriptPubkey) +
    poolMainCovenantScriptPubkey;

  // @todo for loop for waiting ctx
  let settlementOutputs = "";

  const scriptPubkey = utils.publicKeyToScriptPubkey(commitmentData.publicKey);

  let outputTemplateCount = 7;

  if (commitmentData.methodCall === "03") {
    if (poolValidationData.case3outputs.output1.value !== 0) {
      outputTemplateCount = 8;
      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.case3outputs.output1.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case3outputs.output1.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;

      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.case3outputs.output2.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case3outputs.output2.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;
    } else {
      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.output.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;
    }
  } else if (commitmentData.methodCall === "04") {
    if (poolValidationData.case4outputs.output1.value !== 0) {
      console.log(poolValidationData.case4outputs);
      outputTemplateCount = 8;
      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.case4outputs.output1.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case4outputs.output1.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;

      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.case4outputs.output2.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case4outputs.output2.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;
    } else {
      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.output.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
        "001600" +
        utils.compactSizeVarInt(scriptPubkey) +
        scriptPubkey;
    }
  } else {
    settlementOutputs +=
      "01" +
      hexLE(poolValidationData.output.assetId) +
      "01" +
      convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
      "001600" +
      utils.compactSizeVarInt(scriptPubkey) +
      scriptPubkey;
  }

  const orderingFeeNumber = parseInt(hexLE(commitmentData.orderingFee), 16);

  const bandwith = pool.bandwithArray[poolValidationData.leafCount - 1] + orderingFeeNumber;
  const totalFee = commitmentData.cmtOutput1.value * 100000000;

  const serviceFee = totalFee - bandwith;

  const serviceFeeOutput =
    "01499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c1401" +
    convertion.numToLE64LE(WizData.fromNumber(serviceFee)).hex +
    "00160014156e0dc932770529a4946433c500611b9ba77871";

  const txFeeOutput = "01499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c1401" + convertion.numToLE64LE(WizData.fromNumber(bandwith)).hex + "0000";

  const locktime = "00000000";

  const outputTemplate = WizData.fromNumber(outputTemplateCount).hex + output1 + output2 + output3 + output4 + settlementOutputs + serviceFeeOutput + txFeeOutput + locktime;

  // ------------- OUTPUTS END -------------

  // ------------- WITNESS START -------------
  const flagCovenantWitness = "000002";
  const flagCovenantScriptLength = "34";
  const flagCovenantScript = "cd008800c7010088040000000088767651c70100880401000000888852c70100880402000000888853c701008804030000008887";

  const flagCovenantControlBlockLength = "21";
  const flagCovenantControlBlock = "c41dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624";

  const tokenCovenantWitness = "00000002";

  const tokenCovenantScript = "20" + hexLE(poolValidationData.poolData.id) + "00c86987";
  const tokenCovenantScriptLength = utils.compactSizeVarInt(tokenCovenantScript);

  // @todo index temp
  const tokenCovenantControlBlock = taproot.controlBlockCalculation(script, "c4", pubkey.hex, 0);
  const tokenCovenantControlBlockLength = utils.compactSizeVarInt(tokenCovenantControlBlock);

  const lpCovenantWitness = "00000002";
  const lpCovenantScript = tokenCovenantScript;
  const lpCovenantScriptLength = tokenCovenantScriptLength;
  const lpCovenantControlBlockLength = tokenCovenantControlBlockLength;
  const lpCovenantControlBlock = tokenCovenantControlBlock;

  const mainCovenantWitness = "000000";

  // @todo Number of total main covenant  witness elements (2 + 33*s)

  const numberOfWitnessElements = WizData.fromNumber(2 + 33 * poolValidationData.leafCount).hex;

  // ---- SLOT N commitmentoutputtopool fields START ---- (33 witness elements per slot)
  let commitmentoutputtopoolData = "";

  for (let i = 0; i < poolValidationData.leafCount; i++) {
    const tweakKeyPrefixLength = "01";
    const locktimeLength = "04";
    const txFeesLength = "09";
    // @todo calculate fees
    const txFees = commitmentData.cmtOutputFeeHexValue;
    // const changeOutputSorted = changeOutputFinal.sort((a, b) => b.index - a.index);

    let changeOutputs = "";
    let commitmentOutputs = "";

    for (let t = 2; t >= 0; t--) {
      if (commitmentData.changeOutputFinal[t]) {
        const currentChangeOutput = commitmentData.changeOutputFinal[t];
        changeOutputs +=
          utils.compactSizeVarInt(currentChangeOutput.noncScpkey) +
          currentChangeOutput.noncScpkey +
          utils.compactSizeVarInt(currentChangeOutput.assetValue) +
          currentChangeOutput.assetValue;
      } else {
        changeOutputs += "0000";
      }
    }

    if (commitmentData.cmtOutput3) {
      const cmtData =
        "09" +
        commitmentData.cmtOutput3Value +
        "01" +
        commitmentData.cmtOutput3PairValue +
        "09" +
        commitmentData.cmtOutput2Value +
        "01" +
        commitmentData.output2PairValue +
        "09" +
        commitmentData.cmtOutput1Value;
      commitmentOutputs += cmtData;
    } else {
      const cmtData = "00" + "00" + "09" + commitmentData.cmtOutput2Value + "01" + commitmentData.output2PairValue + "09" + commitmentData.cmtOutput1Value;
      commitmentOutputs += cmtData;
    }

    const orderingFeeDetails = utils.compactSizeVarInt(commitmentData.orderingFee) + commitmentData.orderingFee;
    const slippageToleranceDetails = utils.compactSizeVarInt(commitmentData.slippageTolerance) + commitmentData.slippageTolerance;
    const receipentPubkeyDetails = utils.compactSizeVarInt(commitmentData.publicKey) + commitmentData.publicKey;
    const methodCallDetails = utils.compactSizeVarInt(commitmentData.methodCall) + commitmentData.methodCall;
    const outputCountDetails = utils.compactSizeVarInt(commitmentData.outputCount.hex) + commitmentData.outputCount.hex;

    let outpoints = "";

    for (let z = 11; z >= 0; z--) {
      if (commitmentData.cmtTxInOutpoints[z]) {
        outpoints += utils.compactSizeVarInt(commitmentData.cmtTxInOutpoints[z].data) + commitmentData.cmtTxInOutpoints[z].data;
      } else {
        outpoints += "00";
      }
    }

    const inputSequence = "ffffffff";
    const inputSequenceDetails = utils.compactSizeVarInt(inputSequence) + inputSequence;
    const inputCountDetails = utils.compactSizeVarInt(commitmentData.inputCount.hex) + commitmentData.inputCount.hex;

    commitmentoutputtopoolData +=
      tweakKeyPrefixLength +
      commitmentData.tapTweakedResultPrefix +
      locktimeLength +
      locktime +
      txFeesLength +
      txFees +
      changeOutputs +
      commitmentOutputs +
      orderingFeeDetails +
      slippageToleranceDetails +
      receipentPubkeyDetails +
      methodCallDetails +
      outputCountDetails +
      outpoints +
      inputSequenceDetails +
      inputCountDetails;
  }

  let commitmentWitnessFinal = "";
  for (let i = 0; i < poolValidationData.leafCount; i++) {
    const mainCovenantScriptDetails = utils.compactSizeVarInt(poolMainCovenant.mainCovenantScript[0]) + poolMainCovenant.mainCovenantScript[0];
    const mainCovenantControlBlockDetails = utils.compactSizeVarInt(poolMainCovenant.controlBlock) + poolMainCovenant.controlBlock;

    const isAddLiquidity = commitmentData.methodCall === "03";
    const poolCommitment = commitmentOutput.commitmentOutputTapscript(commitmentData.poolId, commitmentData.publicKey, isAddLiquidity);

    const commitmentOutputWitness =
      "00000003" +
      "0101" +
      utils.compactSizeVarInt(poolCommitment.commitmentOutput) +
      poolCommitment.commitmentOutput +
      utils.compactSizeVarInt(poolCommitment.controlBlock) +
      poolCommitment.controlBlock;

    let commitmentWitness = "";
    if (isAddLiquidity) {
      commitmentWitness = commitmentOutputWitness.repeat(3);
    } else {
      commitmentWitness = commitmentOutputWitness.repeat(2);
    }

    commitmentWitnessFinal += mainCovenantScriptDetails + mainCovenantControlBlockDetails + commitmentWitness;
  }

  const witnessTemplate =
    flagCovenantWitness +
    flagCovenantScriptLength +
    flagCovenantScript +
    flagCovenantControlBlockLength +
    flagCovenantControlBlock +
    tokenCovenantWitness +
    tokenCovenantScriptLength +
    tokenCovenantScript +
    tokenCovenantControlBlockLength +
    tokenCovenantControlBlock +
    lpCovenantWitness +
    lpCovenantScriptLength +
    lpCovenantScript +
    lpCovenantControlBlockLength +
    lpCovenantControlBlock +
    mainCovenantWitness +
    numberOfWitnessElements +
    commitmentoutputtopoolData +
    commitmentWitnessFinal +
    "00".repeat(outputTemplateCount * 2 + 1);

  const rawHex = inputTemplate + outputTemplate + witnessTemplate;

  const poolTxId = await api.sendRawTransaction(rawHex);

  return poolTxId;
};
