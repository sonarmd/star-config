module.exports = {
  rules: {
    "arrow-parens": "error",
    curly: "error",
    eqeqeq: "error",
    "max-len": [
      "error",
      {
        code: 100,
        ignoreUrls: true,
        ignorePattern: "const .+ = require\\(",
        ignoreComments: true,
      },
    ],
    "new-cap": ["error", { properties: false }],
    "no-empty": "off",
    "no-implicit-coercion": "error",
    "no-multi-spaces": "error",
    "no-tabs": "error",
    "no-throw-literal": "error",
    "no-trailing-spaces": "error",
    "no-unused-vars": ["error", { args: "none", ignoreRestSiblings: true }],
    "no-var": "error",
    "object-curly-spacing": "error",
    "prefer-promise-reject-errors": "error",
    quotes: [
      "error",
      "single",
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
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
  },
};
