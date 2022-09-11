import axios from "axios";
import { BITMATRIX_RPC_URL } from "../../env";

export const getRawTransaction = async (param: string): Promise<string> => {
  return axios
    .post(
      BITMATRIX_RPC_URL + "rpc",
      JSON.stringify({
        jsonrpc: "1.0",
        id: "curltest",
        method: "getrawtransaction",
        params: [param],
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((response) => {
      return response.data.result;
    })
    .catch((err) => {
      return err;
    });
};
