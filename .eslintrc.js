module.exports = {
  //eslint 9+ 不再需要显式配置 parser，会自动检测
  parserOptions: {
    ecmaVersion: 'latest', // 支持最新 ECMAScript 特性
    sourceType: 'module', // 使用 ES 模块
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    // 可以根据需要添加自定义规则
    'no-console': 'off', // 允许使用 console
    'no-unused-vars': 'warn', // 未使用的变量警告而不是报错
  },
  env: {
    node: true, // 目标环境为 Node.js
    es2021: true, // 支持 ES2021 语法
  },
}
