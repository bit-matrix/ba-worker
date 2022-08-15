import { LogLevel, WebClient } from "@slack/web-api";

const BOT_USER_OAUTH_TOKEN = "xoxb-1891434848919-3894455745527-cNshA5dN0UH2yAgVPI2WKBel";
const channelId = "C03T3JHGMMX";

export const sendSlackMessage = (message: string) => {
  console.log("Message", message + "\n ------------- ");

  const client = new WebClient(BOT_USER_OAUTH_TOKEN, {
    logLevel: LogLevel.DEBUG,
  });

  try {
    const result = client.chat.postMessage({
      channel: channelId,
      text: message,
    });
  } catch (error) {
    console.error("sendSlackMessage.error", error);
  }
};
