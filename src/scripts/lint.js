const { exec } = require("node:child_process");
const { argv } = require("process");
const path = require("path");
const fs = require("node:fs");
const {
  VALID_EXTENSIONS,
  IGNORED_FILES,
  IGNORED_FOLDERS,
  DEFAULT_LINT_MODE,
  MAX_PARALLEL,
} = require("../utils/constants.js");
const log = require("../utils/log.js");

const args = argv.slice(2);
const directory = args[0] || process.cwd();
const absolutePath = path.resolve(process.cwd(), directory);

const flags = args.find((arg) => arg.startsWith("--mode="));
const mode = flags ? flags.split("=")[1] : DEFAULT_LINT_MODE;

// Recursively find all files in the directory
function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    if (IGNORED_FOLDERS.includes(file) || IGNORED_FILES.includes(file)) return;

    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      results = results.concat(findFiles(filePath));
    } else if (
      VALID_EXTENSIONS.includes(path.extname(file)) &&
      !IGNORED_FILES.includes(file)
    ) {
      results.push(filePath);
    }
  });
  return results;
}

const filesToLint = findFiles(absolutePath);
if (filesToLint.length === 0) {
  log(`No lintable files found in directory ${absolutePath}.`, "info");
  process.exit(0);
}

log(
  `Linting ${filesToLint.length} files in ${mode.toUpperCase()} mode...\n`,
  "info"
);

const esLintConfigFile = path.join(__dirname, "../..", "eslint.config.cjs");
let hasErrors = false;

function runLintCommand(filePath) {
  return new Promise((resolve) => {
    log(`Linting  ${filePath}`, "file");
    exec(
      `npx eslint --config "${esLintConfigFile}" "${filePath}"`,
      { cwd: absolutePath },
      (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
        if (error) hasErrors = true;
        resolve();
      }
    );
  });
}

async function runSequential(files) {
  for (const file of files) {
    await runLintCommand(file);
  }
}

async function runParallel(files, batchSize = MAX_PARALLEL) {
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize).map(runLintCommand);
    await Promise.all(batch);
  }
}

(async () => {
  if (mode === "sequential") {
    await runSequential(filesToLint);
  } else {
    await runParallel(filesToLint);
  }

  if (hasErrors) {
    log("Linting finished with errors.", "error");
    process.exit(1);
  } else {
    log("All files linted successfully.", "success");
    process.exit(0);
  }
})();
