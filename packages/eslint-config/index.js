module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "prettier"
  ],
  rules: {
    "arrow-parens": "error",
    curly: "error",
    eqeqeq: "error",
    "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
    "no-undef": "error",
    "no-implicit-coercion": "error",
    "no-multi-spaces": "error",
    "no-duplicate-imports": "error",
    semi: "error",
    "space-before-function-paren": [
      "error",
      {
        anonymous: "never",
        named: "never",
        asyncArrow: "always",
      },
    ],
    strict: "error",
    "wrap-iife": "error",
  }
};
