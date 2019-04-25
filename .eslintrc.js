module.exports = {
  root: true,
  extends: ['standard', 'plugin:vue/recommended'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['vue'],
  env: {
    browser: true,
    es6: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    chrome: 'readonly'
  },
  rules: {}
}
