import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import { readFileSync } from 'node:fs'
import tseslint from 'typescript-eslint'

const ignoreList = readFileSync('.prettierignore', 'utf-8')
  .split('\n')
  .filter((line) => line.trim() && !line.startsWith('#'))

const configFiles = ['**/*.config.mjs', '**/*.config.cjs', '**/*.config.js']
const typeScriptExtensions = ['.ts', '.tsx', '.cts', '.mts']

export default defineConfig(
  tseslint.config(
    {
      ignores: [...ignoreList, ...configFiles],
    },
    {
      languageOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        parserOptions: {
          project: './tsconfig.eslint.json',
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      files: [...typeScriptExtensions].map((ext) => `**/*${ext}`),
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
      rules: {
        '@typescript-eslint/no-floating-promises': [
          'error',
          {
            ignoreVoid: false,
            ignoreIIFE: false,
          },
        ],
        '@typescript-eslint/await-thenable': 'error',
      },
    }
  )
)
