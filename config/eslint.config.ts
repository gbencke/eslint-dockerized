import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  extends: [
    eslint.configs.all,
    tseslint.configs.strictTypeChecked,
    functional.configs.recommended,
    functional.configs.stylistic,
    pluginPromise.configs['flat/recommended'],
    eslintReact.configs["recommended-type-checked"],
  ],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    "functional/no-classes": "off",
    "functional/no-expression-statements": "off",
    "functional/functional-parameters": "off",
  },
});
