module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:promise/recommended',
        // 'plugin:prettier/recommended',
        'plugin:react-hooks/recommended',
    ],
    env: {
        browser: true,
        node: true,
    },
    rules: {
        'import/prefer-default-export': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    overrides: [
        {
            files: ['**/*.js'],
            rules: {
                'global-require': 'off',
                '@typescript-eslint/no-require-imports': 'off',
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/naming-convention': 'off',
            },
        },
    ],
};
