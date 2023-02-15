/* Copyright 2021, Milkdown by Mirone. */

module.exports = {
  extends: [
    '@antfu',
  ],
  plugins: ['header'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    '.idea',
    'lib',
    'snapshots.js',
    'docs',
    'CHANGELOG.md',
  ],
  rules: {
    'yml/no-empty-mapping-value': 'off',
    'unused-imports/no-unused-imports': 'off',
    'unused-imports/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
  overrides: [
    {
      files: ['**/theme-nord/**/*.ts'],
      extends: [
        'plugin:tailwindcss/recommended',
      ],
      rules: {
        'tailwindcss/no-custom-classname': 'off',
      },
    },
    {
      files: ['**/react/**/*.tsx', '**/react/**/*.ts'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        'jsx-quotes': ['error', 'prefer-double'],
        'react/jsx-indent': ['error', 2, { checkAttributes: true, indentLogicalExpressions: true }],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
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
        'header/header': ['error', 'block', ' Copyright 2021, Milkdown by Mirone. '],
      },
    },
  ],
}
