// eslint.config.js
module.exports = [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        console: true,
      },
    },
    rules: {
      "no-undef": "error",
    },
  },
];
