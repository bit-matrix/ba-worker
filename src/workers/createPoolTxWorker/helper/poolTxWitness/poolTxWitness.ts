import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { ctxsWitness } from "./ctxsWitness";
import { flagCovenant } from "./flagCovenant";
import { lpHolderCovenant } from "./lpHolderCovenant";
import { numberOfMainCovenantWitnessElements } from "./numberOfMainCovenantWitnessElements";
import { outputsZeros } from "./outputsZeros";
import { settlements } from "./settlements";
import { tokenHolderCovenant } from "./tokenHolderCovenant";

export const poolTxWitness = async (pool: Pool, poolConfig: BmConfig, ctxs: BmCtxNew[]): Promise<string> => {
  const poolAssetLE = hexLE(pool.id);

  const flagCovenantEncoded = flagCovenant(pool.holderCovenant.controlBlockPrefix.main);
  const tokenHolderCovenantEncoded = tokenHolderCovenant(poolAssetLE, pool.holderCovenant.controlBlockPrefix.token);
  const lpHolderCovenantEncoded = lpHolderCovenant(poolAssetLE, pool.holderCovenant.controlBlockPrefix.lp);

  const numberOfMainCovenantWitnessElementsEncoded = numberOfMainCovenantWitnessElements(ctxs.length);

  const settlementsEncoded: string = await settlements(ctxs);
  let mainCovenantScriptIndex: number = ctxs.length - 1;
  // mainCovenantScriptIndex = mainCovenantScriptIndex < 4 ? mainCovenantScriptIndex : 3;
  const mainCovenantScript = pool.mainCovenantScript[mainCovenantScriptIndex];

  const ctxsWitnessEncoded = ctxsWitness(ctxs);
  const outputsZerosEncoded = outputsZeros(ctxs.length);

  return (
    "0000" +
    flagCovenantEncoded +
    tokenHolderCovenantEncoded +
    lpHolderCovenantEncoded +
    numberOfMainCovenantWitnessElementsEncoded +
    settlementsEncoded +
    mainCovenantScript +
    ctxsWitnessEncoded +
    outputsZerosEncoded
  );
};
