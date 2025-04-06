
const fs = require('node:fs');
const content = process.env.NODE_PATH ?? "Nothing";
try {
  fs.writeFileSync('/data/saida.txt', content);
} catch (err) {
  console.error(err);
}

// import functional from "eslint-plugin-functional";
const functional = require("eslint-plugin-functional");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config({
  files: ["**/*.ts"], 
  extends: [
    functional.configs.externalTypeScriptRecommended,
    functional.configs.recommended,
    functional.configs.stylistic,
    // your other plugin configs here
  ],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    // any rule configs here
  },
});
