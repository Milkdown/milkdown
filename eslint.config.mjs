import antfu from '@antfu/eslint-config'

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
)
