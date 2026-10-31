module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-restricted-globals': [
      'error',
      {
        name: 'HWH5',
        message: '禁止直接使用 HWH5，必须通过适配层（@/adapters）调用。',
      },
      {
        name: 'wx',
        message: '禁止直接使用 wx，必须通过适配层（@/adapters）调用。',
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: "MemberExpression[object.name='navigator'][property.name='geolocation']",
        message: '禁止直接调用 navigator.geolocation，必须通过 GeoAdapter。',
      },
      {
        selector: "MemberExpression[object.name='navigator'][property.name='mediaDevices']",
        message: '禁止直接调用 navigator.mediaDevices，必须通过 ScanAdapter。',
      },
    ],
  },
  overrides: [
    {
      files: ['src/adapters/**/*', 'src/app/**/*'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
      },
    },
  ],
  ignorePatterns: ['dist', 'node_modules', '*.config.ts'],
};