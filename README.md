# Dockerized eslint

This repository contains a self-contained eslint linter to be used in the root of any TS project.

It was initially forked from [cytopia/docker-eslint](https://github.com/cytopia/docker-eslint)

## Configuration

Default configuration:

```typescript
import eslint from '@eslint/js';
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";
import pluginPromise from "eslint-plugin-promise";

export default tseslint.config({
  files: ["**/*.ts"],
  extends: [
    eslint.configs.all,
    tseslint.configs.strictTypeChecked,
    functional.configs.recommended,
    functional.configs.stylistic,
    pluginPromise.configs['flat/recommended'],
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
```

## In order to build:

```
docker build -t dockerized-eslint .
```

## In order to run

```
docker run -it --rm -v $(pwd):/data dockerized-eslint -c /config/eslint.config.ts .
```
