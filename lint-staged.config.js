module.exports = {
  "*.{js,jsx,ts,tsx}": [
    "eslint --max-warnings=0 --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": ["prettier --write"]
};
