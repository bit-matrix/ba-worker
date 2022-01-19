import { BmCtxNew } from "@bitmatrix/models";

const ctxWitness = (ctx: BmCtxNew): string => {
  const tapscript = ctx.output.compiledData;
  const tapscriptPrefix = ctx.output.tweakPrefix;

  return (
    "00000003" + // commitment input 1 witness
    "0101" +
    // tapscript lenght
    "5c" +
    tapscript +
    "21" +
    tapscriptPrefix + // c4-c5
    "1dae61a4a8f841952be3a511502d4f56e889ffa0685aa0098773ea2d4309f624"
  );
};

export const ctxsWitness = (ctxs: BmCtxNew[]): string => {
  const ctxWitnesses = ctxs.map((ctx) => ctxWitness(ctx));
  return ctxWitnesses.join("");
};
