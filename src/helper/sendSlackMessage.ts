import { LogLevel, WebClient } from "@slack/web-api";

const BOT_USER_OAUTH_TOKEN = "xoxb-3891760304886-3901195336611-5EMFToIRWzoPIcK0QqrQa6DC";
const channelId = "C03SKM0NEJG";

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

    console.log(result);
  } catch (error) {
    console.error("sendSlackMessage.error", error);
  }
};
