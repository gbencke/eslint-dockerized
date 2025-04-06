import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.ts"],
  extends: [
    eslint.configs.all,
    tseslint.configs.strictTypeChecked,
    functional.configs.recommended,
    functional.configs.stylistic,
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
