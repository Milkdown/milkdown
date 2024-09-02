import antfu from '@antfu/eslint-config'

export default antfu(
  {
    stylistic: true,
    ignores: [
      '.idea',
      'lib',
      'snapshots.js',
      'docs',
      'CHANGELOG.md',
    ],
    vue: {
      overrides: {
        'vue/one-component-per-file': 'off',
      },
    },
    typescript: {
      overrides: {
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
