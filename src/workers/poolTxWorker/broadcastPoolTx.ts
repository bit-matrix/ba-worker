import { Pool, BitmatrixStoreData } from "@bitmatrix/models";
import WizData, { hexLE } from "@script-wiz/wiz-data";
import { convertion, taproot, TAPROOT_VERSION, utils } from "@script-wiz/lib-core";
import { api, commitmentOutput, pool as poolFunc } from "@bitmatrix/lib";
import { validatePoolTx } from "./validatePoolTx";

export const broadcastPoolTx = async (bitmatrixStoreData: BitmatrixStoreData[], pool: Pool): Promise<string> => {
  // ------------- INPUTS START -------------

  // constants
  const version = "02000000";
  const const1 = "01";

  // pool last state inputs
  const input1 = hexLE(pool.lastStateTxId) + convertion.convert32(WizData.fromNumber(0)).hex + "00" + "01000000";
  const input2 = hexLE(pool.lastStateTxId) + convertion.convert32(WizData.fromNumber(1)).hex + "00" + "01000000";
  const input3 = hexLE(pool.lastStateTxId) + convertion.convert32(WizData.fromNumber(2)).hex + "00" + "01000000";
  const input4 = hexLE(pool.lastStateTxId) + convertion.convert32(WizData.fromNumber(3)).hex + "00" + "01000000";

  let inputs = input1 + input2 + input3 + input4;
  let inputCount = 4;

  bitmatrixStoreData.forEach((bsd) => {
    const input5 = hexLE(bsd.commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(bsd.commitmentData.cmtOutput1.n)).hex + "00" + "01000000";
    const input6 = hexLE(bsd.commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(bsd.commitmentData.cmtOutput2.n)).hex + "00" + "01000000";
    inputs += input5 + input6;

    if (bsd.commitmentData.cmtOutput3) {
      const input7 = hexLE(bsd.commitmentData.transaction.txid) + convertion.convert32(WizData.fromNumber(bsd.commitmentData.cmtOutput3.n)).hex + "00" + "01000000";
      inputs += input7;
    }

    inputCount += bsd.commitmentData.methodCall === "03" ? 3 : 2;
  });

  const inputTemplate = version + const1 + WizData.fromNumber(inputCount).hex + inputs;

  // ------------- INPUTS END -------------

  // ------------- OUTPUTS START -------------

  const script = [WizData.fromHex("20" + hexLE(pool.id) + "00c86987")];
  const pubkey = WizData.fromHex("1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624");

  const poolMainCovenant = poolFunc.createCovenants(pool.leafCount - 1, bitmatrixStoreData.length - 1, pool.id, pool.pair1_coefficient.number, pool.lpFeeTierIndex.number);

  const flagCovenantScriptPubkey = "512070d3017ab2a8ae4cccdb0537a45fb4a3192bff79c49cf54bd9edd508dcc93f55";
  const tokenCovenantScriptPubkey = taproot.tapRoot(pubkey, script, TAPROOT_VERSION.LIQUID).scriptPubkey.hex;
  const lpHolderCovenantScriptPubkey = tokenCovenantScriptPubkey;
  const poolMainCovenantScriptPubkey = poolMainCovenant.taprootResult.scriptPubkey.hex;

  let settlementOutputs = "";

  let outputTemplateCount = 6;

  let activePool: Pool = { ...pool };
  let orderingFeeNumber = 0;
  let totalFee = 0;

  bitmatrixStoreData.forEach((bsd) => {
    const poolValidationData = validatePoolTx(bsd.commitmentData, activePool);

    const scriptPubkey = utils.publicKeyToScriptPubkey(bsd.commitmentData.publicKey);

    if (bsd.commitmentData.methodCall === "03") {
      if (poolValidationData.case3outputs.output1.value !== 0) {
        outputTemplateCount += 2;
        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.case3outputs.output1.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case3outputs.output1.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);

        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.case3outputs.output2.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case3outputs.output2.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);
      } else {
        outputTemplateCount += 1;

        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.output.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);
      }
    } else if (bsd.commitmentData.methodCall === "04") {
      if (poolValidationData.case4outputs.output1.value !== 0) {
        outputTemplateCount += 2;
        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.case4outputs.output1.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case4outputs.output1.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);

        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.case4outputs.output2.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.case4outputs.output2.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);
      } else {
        outputTemplateCount += 1;

        settlementOutputs +=
          "01" +
          hexLE(poolValidationData.output.assetId) +
          "01" +
          convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
          "001600" +
          utils.compactSizeVarIntData(scriptPubkey);
      }
    } else {
      outputTemplateCount += 1;
      settlementOutputs +=
        "01" +
        hexLE(poolValidationData.output.assetId) +
        "01" +
        convertion.numToLE64LE(WizData.fromNumber(poolValidationData.output.value)).hex +
        "001600" +
        utils.compactSizeVarIntData(scriptPubkey);
    }

    orderingFeeNumber += parseInt(hexLE(bsd.commitmentData.orderingFee), 16);
    totalFee += bsd.commitmentData.cmtOutput1.value * 100000000;

    const finalPool = { ...activePool };

    finalPool.quote.value = poolValidationData.result.new_pool_pair_1_liquidity.toString();
    finalPool.token.value = poolValidationData.result.new_pool_pair_2_liquidity.toString();
    finalPool.lp.value = poolValidationData.result.new_pool_lp_liquidity.toString();

    activePool = finalPool;
  });

  const output1 = "01" + hexLE(pool.id) + "01" + "0000000000000001" + "00" + utils.compactSizeVarIntData(flagCovenantScriptPubkey);

  const output2 =
    "01" +
    hexLE(pool.token.assetHash) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(Number(activePool.token.value))).hex +
    "00" +
    utils.compactSizeVarIntData(tokenCovenantScriptPubkey);

  const output3 =
    "01" +
    hexLE(pool.lp.assetHash) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(Number(activePool.lp.value))).hex +
    "00" +
    utils.compactSizeVarIntData(lpHolderCovenantScriptPubkey);

  const output4 =
    "01" +
    hexLE(pool.quote.assetHash) +
    "01" +
    convertion.numToLE64LE(WizData.fromNumber(Number(activePool.quote.value))).hex +
    "00" +
    utils.compactSizeVarIntData(poolMainCovenantScriptPubkey);

  const bandwith = poolFunc.bandwithArray[bitmatrixStoreData.length - 1] + orderingFeeNumber;

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

  const tokenCovenantScript = utils.compactSizeVarIntData("20" + hexLE(pool.id) + "00c86987");
  // @todo index temp
  const tokenCovenantControlBlock = utils.compactSizeVarIntData(taproot.controlBlockCalculation(script, "c4", pubkey.hex, bitmatrixStoreData.length - 1));

  console.log("tokenCovenantControlBlock", tokenCovenantControlBlock);

  const lpCovenantWitness = "00000002";
  const lpCovenantScript = tokenCovenantScript;
  const lpCovenantControlBlock = tokenCovenantControlBlock;

  const mainCovenantWitness = "000000";

  // @todo Number of total main covenant  witness elements (2 + 33*s)

  const numberOfWitnessElements = WizData.fromNumber(2 + 4 * bitmatrixStoreData.length).hex;

  console.log("numberOfWitnessElements", numberOfWitnessElements);

  // ---- SLOT N commitmentoutputtopool fields START ---- (33 witness elements per slot)

  let commitmentoutputtopoolData = "";

  [...bitmatrixStoreData].reverse().forEach((bsd) => {
    commitmentoutputtopoolData +=
      utils.compactSizeVarIntData(bsd.commitmentData.tweakKeyPrefix) +
      utils.compactSizeVarIntData(bsd.commitmentData.part1) +
      utils.compactSizeVarIntData(bsd.commitmentData.part2) +
      utils.compactSizeVarIntData(bsd.commitmentData.part3);
  });

  const mainCovenantScriptDetails = utils.compactSizeVarIntData(poolMainCovenant.mainCovenantScript[bitmatrixStoreData.length - 1]);
  const mainCovenantControlBlockDetails = utils.compactSizeVarIntData(poolMainCovenant.controlBlock);

  let commitmentWitnessFinal = "";

  bitmatrixStoreData.forEach((bsd) => {
    const isAddLiquidity = bsd.commitmentData.methodCall === "03";
    const poolCommitment = commitmentOutput.commitmentOutputTapscript(pool.id, bsd.commitmentData.publicKey);

    const commitmentOutputWitness = "00000002" + utils.compactSizeVarIntData(poolCommitment.commitmentOutput) + utils.compactSizeVarIntData(poolCommitment.controlBlock);

    let commitmentWitness = "";
    if (isAddLiquidity) {
      commitmentWitness = commitmentOutputWitness.repeat(3);
    } else {
      commitmentWitness = commitmentOutputWitness.repeat(2);
    }

    commitmentWitnessFinal += commitmentWitness;
  });

  console.log("commitmentWitnessFinal", commitmentWitnessFinal);
  const witnessTemplate =
    flagCovenantWitness +
    flagCovenantScriptLength +
    flagCovenantScript +
    flagCovenantControlBlockLength +
    flagCovenantControlBlock +
    tokenCovenantWitness +
    tokenCovenantScript +
    tokenCovenantControlBlock +
    lpCovenantWitness +
    lpCovenantScript +
    lpCovenantControlBlock +
    mainCovenantWitness +
    numberOfWitnessElements +
    commitmentoutputtopoolData +
    mainCovenantScriptDetails +
    mainCovenantControlBlockDetails +
    commitmentWitnessFinal +
    "00".repeat(outputTemplateCount * 2 + 1);

  const rawHex = inputTemplate + outputTemplate + witnessTemplate;

  console.log("inputTemplate", inputTemplate);
  console.log("outputTemplate", outputTemplate);
  console.log("witnessTemplate", witnessTemplate);
  console.log("rawhEX", rawHex);

  let poolTxId = "";

  try {
    poolTxId = await api.sendRawTransaction(rawHex);
  } catch (e) {
    console.log("error:", e);
  }

  return poolTxId;
};
