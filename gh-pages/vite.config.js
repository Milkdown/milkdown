export default {
    base: '/milkdown/',
    build: {
        commonjsOptions: {
            input: ['@milkdown/core', '@milkdown/plugin-prism'],
        },
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        include: ['@milkdown/core', '@milkdown/plugin-prism'],
    },
};
