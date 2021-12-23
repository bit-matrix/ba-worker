import axios from "axios";

const BITMATRIX_WATCHTOWER = {
  token: "AAGLP1BTJQ9i7Y2Old7MsV3daCWg0RVLqzs",
  chatId: "-707696434",
};

export const sendTelegramMessage = (message: string) => {
  console.log("Message", message + "\n ------------- ");

  try {
    const url = "https://api.telegram.org/bot2145331675:" + BITMATRIX_WATCHTOWER.token + "/sendMessage?chat_id=" + BITMATRIX_WATCHTOWER.chatId + "&parse_mode=html";
    return axios.get(
      // "https://api.telegram.org/bot2145331675:AAGLP1BTJQ9i7Y2Old7MsV3daCWg0RVLqzs/sendMessage?chat_id=-707696434&parse_mode=html&text=" + message + "\n ------------- "
      url + "&text=" + message + "\n ------------- "
    );
  } catch (error) {
    console.log("sendTelegramMessage.error", error);
  }
};
