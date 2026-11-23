import { createApp } from "./app.js";
import { readConfig } from "./config.js";

const config = readConfig();
const server = createApp().listen(config.PORT, config.HOST, () => {
  console.info(`Kinova listening on http://${config.HOST}:${config.PORT}`);
});

server.on("error", () => {
  console.error("Kinova could not start its HTTP server. Check host and port availability.");
  process.exitCode = 1;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(error => {
    clearTimeout(timeout);
    process.exitCode = error ? 1 : 0;
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
