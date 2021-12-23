import { Block, esploraClient } from "@bitmatrix/esplora-api-client";
import axios from "axios";

export const sendRawTransaction = async (txHex: string): Promise<any> => {
  /* const test = await axios
    .post("https://rpc.bitmatrix-aggregate.com/rpc", { jsonrpc: "1.0", id: "t0", method: "getnewblockhex", params: [] }, { headers: { "Content-Type": "application/json" } })
    .then((res) => res.data)
    .catch((er) => {
      console.error("getnewblockhex.error", er);
    });
    {
      result: '000000a062c7214c10c3f8a570d3437a9d99c9d9b4a98fae368156ecd5712b1baca623ead81e027190dd2806101da9e9031e18d3f893999ff973eed4ebe9f55152f8b5df6246c361681d020001220020e9e4117540f7f23b3edd7c2cad660a17fb33c7959b8c37cf61d92b189133929a96000000fbee9cea00d8efdc49cfbec328537e0d7032194de6ebf3cf42e5c05bb89a08b10000010200000001010000000000000000000000000000000000000000000000000000000000000000ffffffff0603681d020101ffffffff0201499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c1401000000000000000000016a01499a818545f6bae39fc03b637f2a4e1e64e590cac1bc3a6f6d71aa4443654c1401000000000000000000266a24aa21a9ed94f15ed3a62165e4a0b99699cc28b48e19cb5bc1b1f47155db62d63f1e047d45000000000000012000000000000000000000000000000000000000000000000000000000000000000000000000',
      error: null,
      id: 't0'
    } */

  console.log("************ sendRawTransaction ************");
  console.log('/root/elements/elements-elements-0.21.0.1/bin/elements-cli sendrawtransaction "' + txHex + '"');
  console.log("************");

  let poolTxid: any = "";
  poolTxid = await axios
    .post(
      "https://rpc.bitmatrix-aggregate.com/rpc",
      { jsonrpc: "1.0", id: "t0", method: "sendrawtransaction", params: [txHex] },
      { headers: { "Content-Type": "application/json" } }
    )
    .then((res) => res.data)
    .catch((er) => {
      console.error("sendrawtransaction.error", er);
    });

  if (poolTxid && poolTxid.error === null && poolTxid.result && poolTxid.result.length === 64) {
    return poolTxid.result;
  }

  console.error("sendRawTransaction.error. poolTxid: ", poolTxid);
  return;
};
