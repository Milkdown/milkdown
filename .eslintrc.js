/* Copyright 2021, Milkdown by Mirone. */

module.exports = {
  extends: ['@antfu/eslint-config-ts', 'plugin:react-hooks/recommended'],
  plugins: ['header', 'eslint-plugin-tsdoc'],
  rules: {
    'tsdoc/syntax': 'warn',
    'yml/no-empty-mapping-value': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/vue/**/*.tsx'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
    {
      files: ['**/table/**/*.ts'],
      rules: {
        eqeqeq: 'off',
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js'],
      rules: {
        'header/header': [
          'error',
          'block',
          ' Copyright 2021, Milkdown by Mirone. ',
        ],
      },
    },
  ],
}
