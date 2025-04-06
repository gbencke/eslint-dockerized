import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("hardcore"),
    rules:{
"unicorn/import-index": "off",
"@shopify/typescript/prefer-singular-enums": "off",
"sonarjs/no-unused-collection": "off",
"sonarjs/no-empty-collection": "off",
"@typescript-eslint/await-thenable": "off",
"@typescript-eslint/consistent-type-assertions": "off",
"@typescript-eslint/dot-notation": "off",
"@typescript-eslint/consistent-type-exports": "off",
"@typescript-eslint/naming-convention": "off"
    },

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: true,
        },
    },
}]);
