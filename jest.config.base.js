module.exports = {
    preset: 'ts-jest/presets/js-with-babel',
    testEnvironment: 'jsdom',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
    transformIgnorePatterns: ['node_modules/!lodash-es'],
};
