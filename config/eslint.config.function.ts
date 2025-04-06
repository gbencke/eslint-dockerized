import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.ts"],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
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
