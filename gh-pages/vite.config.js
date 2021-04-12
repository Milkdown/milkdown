export default {
    base: '/milkdown/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        exclude: ['@milkdown/core', '@milkdown/plugin-prism'],
    },
};
