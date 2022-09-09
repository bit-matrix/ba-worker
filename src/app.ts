import { startWorkers } from "./workers";
import { memoryUsage } from "node:process";

const onExit = async () => {
  console.log("BA WORKER Service stopped.");
};

process.on("exit", onExit);

process.on("SIGINT", () => {
  console.log("SIGINTTTT");
  process.exit();
});

process.on("uncaughtException", function (err) {
  console.log("Caught exception: ", err);
});

console.log("BA WORKER Service started");

startWorkers();
