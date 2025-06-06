const { execSync } = require("child_process");
const { argv } = require("process");
const path = require("path");
const fs = require("node:fs");
const {
  VALID_EXTENSIONS,
  IGNORED_FILES,
  IGNORED_FOLDERS,
  DEFAULT_LINT_MODE,
} = require("../utils/constants.js");
const log = require("../utils/log.js");

const args = argv.slice(2);
const directory = args[0] || process.cwd();
const absolutePath = path.resolve(process.cwd(), directory);

const modeArg = args.find((arg) => arg.startsWith("--mode="));
const mode = modeArg ? modeArg.split("=")[1] : DEFAULT_LINT_MODE;
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

const fileToLint = findFiles(absolutePath);
if (fileToLint.length === 0) {
  log(`No lintable files found in directory ${absolutePath}.`, "info");
  process.exit(0);
}

const esLintConfigFile = path.join(__dirname, "../..", "eslint.config.cjs");

log(
  `Linting ${fileToLint.length} files in ${mode.toUpperCase()} mode...`,
  "info"
);
let hasErrors = false;
fileToLint.forEach((file) => {
  log(`Linting  ${file}`, "file");

  try {
    const result = execSync(
      `npx eslint --config "${esLintConfigFile}" "${file}"`,
      {
        cwd: absolutePath,
        stdio: "pipe",
      }
    );

    if (result.toString()) {
      console.log(result.toString());
    }
  } catch (error) {
    hasErrors = true;
    if (error.stdout) {
      console.log(error.stdout.toString());
    }
    if (error.stderr) {
      console.log(error.stderr.toString());
    }
  }
});

if (hasErrors) {
  log("Linting finished with errors.", "error");
  process.exit(1);
} else {
  log("All files linted successfully with no errors.", "success");
  process.exit(0);
}
