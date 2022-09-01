import axios from "axios";
import { BITMATRIX_WATCHTOWER, TELEGRAM_URL } from "../env";

export const sendTelegramMessage = (message: string) => {
  console.log("Message", message + "\n ------------- ");

  try {
    const url = TELEGRAM_URL + BITMATRIX_WATCHTOWER.token + "/sendMessage?chat_id=" + BITMATRIX_WATCHTOWER.chatId + "&parse_mode=html";
    return axios.get(url + "&text=" + message + "\n ------------- ");
  } catch (error) {
    console.log("sendTelegramMessage.error", error);
  }
};
