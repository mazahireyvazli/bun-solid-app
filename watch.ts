import { $ } from "bun";
import { watch } from "fs";

const SRC_DIR = "./src";
const SERVER_DIR = "./server";

const srcWatcher = watch(SRC_DIR, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename}`);
  await $`make build-dev`;
});

const serverWatcher = watch(SERVER_DIR, { recursive: true }, async (event, filename) => {
  console.log(`Detected ${event} in ${filename}`);
  await $`make build-dev`;
});

process.on("SIGINT", async () => {
  srcWatcher.close();
  serverWatcher.close();

  process.exit(0);
});
