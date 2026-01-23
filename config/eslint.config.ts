import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  extends: [
    eslint.configs.all,
    tseslint.configs.strictTypeChecked,
    functional.configs.recommended,
    functional.configs.stylistic,
    pluginPromise.configs['flat/recommended'],
  ],
  plugins: {
    react,
    'react-hooks': reactHooks,
    'jsx-a11y': jsxA11y,
  },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    "functional/no-classes": "off",
    "functional/no-expression-statements": "off",
    "functional/functional-parameters": "off",
    ...react.configs.recommended.rules,
    ...reactHooks.configs.recommended.rules,
    ...jsxA11y.configs.recommended.rules,
  },
});
