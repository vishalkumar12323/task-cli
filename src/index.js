const { spawn } = require("node:child_process");
const { argv } = require("node:process");
const path = require("node:path");
const task = require("./task.config");
const log = require("./utils/log");

const [command, ...commandArgs] = argv.slice(2);
const scriptPath = path.join(__dirname, "scripts", `${command}.js`);

if (!command || !scriptPath.endsWith(".js") || !task[command]) {
  log(`Unknow command: ${command}.`, "error");
  log(`\nAvailable commands: ${Object.keys(task).join(", ")}`, "info");
  process.exit(1);
}

if (command === "lint") {
  const child = spawn("node", [scriptPath, ...commandArgs], {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "development",
    },
  });

  child.on("error", (error) => {
    log(`Error executing command: ${error.message}`, "error");
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code);
  });
} else {
  log(`Unknow command: ${command}.`, "error");
  log(`\nAvailable commands: ${Object.keys(task).join(", ")}`, "info");
  process.exit(1);
}
