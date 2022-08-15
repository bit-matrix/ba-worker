import { LogLevel, WebClient } from "@slack/web-api";

const BOT_USER_OAUTH_TOKEN = "xoxp-1891434848919-2754300617426-3964185336672-22b0495ed5ed01c9cb014ab5475429b3";
const channelId = "C03T3JHGMMX";

export const sendSlackMessage = async (message: string) => {
  console.log("Message", message + "\n ------------- ");

  // const client = new WebClient(BOT_USER_OAUTH_TOKEN, {
  //   logLevel: LogLevel.DEBUG,
  // });

  // try {
  //   const result = client.chat.postMessage({
  //     channel: channelId,
  //     text: message,
  //   });
  // } catch (error) {
  //   console.error("sendSlackMessage.error", error);
  // }

  const client = new WebClient("xoxp-1891434848919-2754300617426-3964185336672-22b0495ed5ed01c9cb014ab5475429b3", {
    // LogLevel can be imported and used to make debugging simpler
    logLevel: LogLevel.DEBUG,
  });

  // Post a message to a channel your app is in using ID and message text
  try {
    // Call the chat.postMessage method using the built-in WebClient
    const result = await client.chat.postMessage({
      // The token you used to initialize your app
      token: "xoxp-1891434848919-2754300617426-3964185336672-22b0495ed5ed01c9cb014ab5475429b3",
      channel: "C03T3JHGMMX",
      text: message,
      // You could also use a blocks[] array to send richer content
    });

    // Print result, which includes information about the message (like TS)
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};
