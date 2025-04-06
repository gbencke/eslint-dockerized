const hardcore = require("eslint-config-hardcore")
const { defineConfig } = require("eslint/config");

module.exports = defineConfig({
  plugins: {
    hardcore: hardcore
  },
  // extends: ["hardcore", "hardcore/ts"],
});

