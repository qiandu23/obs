module.exports = {
  "env": {
    "es2020": true,
    "node": true,
    "mocha": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "rules": {
    "indent": [
      "warn",
      2
    ],
    "linebreak-style": [
      "warn",
      "unix"
    ],
    "quotes": [
      "warn",
      "single"
    ],
    "semi": [
      "warn",
      "never"
    ],
    "no-console": [
      "off"
    ],
    "no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_" }
    ],
    eqeqeq: ["error", "smart"],
    "no-var": "error"
  }
};
