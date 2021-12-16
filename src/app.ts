import { startWorkers } from "./workers";

const onExit = async () => {
  console.log("BA WORKER Service stopped.");
};
process.on("exit", onExit);
process.on("SIGINT", () => {
  process.exit();
});

console.log("BA WORKER Service started");

startWorkers();
