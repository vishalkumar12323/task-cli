module.exports = {
  VALID_EXTENSIONS: [".js", ".jsx", ".ts", ".tsx"],
  IGNORED_FOLDERS: ["node_modules", ".git"],
  IGNORED_FILES: [
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "eslint.config.cjs",
    ".eslintrc.js",
    ".eslintrc.json",
    ".prettierrc",
    ".prettierrc.js",
    ".prettierrc.json",
  ],
  DEFAULT_LINT_MODE: "parallel",
};
