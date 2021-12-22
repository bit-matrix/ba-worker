import { Block, esploraClient } from "@bitmatrix/esplora-api-client";

export const getNewBlock = async (bestBlock10: Block[], wantedNewBlockHeight: number): Promise<{ newBlock: Block; bestBlock: Block } | undefined> => {
  const bestBlock = bestBlock10[0];

  const diff = bestBlock.height - wantedNewBlockHeight;
  if (diff < 0) {
    console.log("getNewBlock: already synced: " + wantedNewBlockHeight + " / " + bestBlock.height);
    return;
  }

  let newBlock: Block;
  if (diff < 10) {
    newBlock = bestBlock10[diff];
  } else {
    const block10 = await esploraClient.blocks(wantedNewBlockHeight);
    newBlock = block10[0];
  }
  console.log("getNewBlock: " + newBlock.height + " / " + bestBlock.height);
  return { newBlock, bestBlock };
};
