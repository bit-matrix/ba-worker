import { BmConfig, BmCtxNew, Pool } from "@bitmatrix/models";
import { hexLE } from "@script-wiz/wiz-data";
import { flagCovenant } from "./flagCovenant";
import { lpHolderCovenant } from "./lpHolderCovenant";
import { numberOfMainCovenantWitnessElements } from "./numberOfMainCovenantWitnessElements";
import { settlements } from "./settlements";
import { tokenHolderCovenant } from "./tokenHolderCovenant";

export const poolTxWitness = async (pool: Pool, poolConfig: BmConfig, ctxs: BmCtxNew[]): Promise<string> => {
  const poolAssetLE = hexLE(pool.id);

  const flagCovenantEncoded = flagCovenant(poolConfig.holderCovenant.controlBlockPrefix.main);
  const tokenHolderCovenantEncoded = tokenHolderCovenant(poolAssetLE, poolConfig.holderCovenant.controlBlockPrefix.token);
  const lpHolderCovenantEncoded = lpHolderCovenant(poolAssetLE, poolConfig.holderCovenant.controlBlockPrefix.lp);

  const numberOfMainCovenantWitnessElementsEncoded = numberOfMainCovenantWitnessElements(ctxs.length);

  const settlementsEncoded: string = await settlements(ctxs);
  const mainCovenantScript = poolConfig.mainCovenantScript;

  return (
    "0000" +
    flagCovenantEncoded +
    tokenHolderCovenantEncoded +
    lpHolderCovenantEncoded +
    settlementsEncoded +
    numberOfMainCovenantWitnessElementsEncoded +
    mainCovenantScript +
    "TODO"
  );
};
