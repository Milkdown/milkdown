/* Copyright 2021, Milkdown by Mirone. */

import antfu from '@antfu/eslint-config'
import header from 'eslint-plugin-header'
import react from 'eslint-plugin-react'
import hooks from 'eslint-plugin-react-hooks'

export default antfu(
  {
    stylistic: true,
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },
    ignores: [
      '.idea',
      'lib',
      'snapshots.js',
      'docs',
      'CHANGELOG.md',
    ],
    overrides: {
      vue: {
        'vue/one-component-per-file': 'off',
      },
      typescript: {
        'ts/no-unsafe-assignment': 'off',
        'ts/no-unsafe-member-access': 'off',
        'ts/no-unsafe-argument': 'off',
        'ts/no-unsafe-call': 'off',
        'ts/no-unsafe-return': 'off',
        'ts/no-floating-promises': 'off',
        'ts/restrict-template-expressions': 'off',
        'ts/unbound-method': 'off',
        'unused-imports/no-unused-vars': 'off',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      header,
    },
    rules: {
      'header/header': ['error', 'block', ' Copyright 2021, Milkdown by Mirone. '],
    },
  },
  {
    files: ['**/react/**/*.tsx', '**/react/**/*.ts'],
    plugins: {
      'react': react,
      'react-hooks': hooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...hooks.configs.recommended.rules,
      'jsx-quotes': ['error', 'prefer-double'],
      'react/jsx-indent': ['error', 2, { checkAttributes: true, indentLogicalExpressions: true }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
)
