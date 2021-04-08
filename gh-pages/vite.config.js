export default {
    build: {
        commonjsOptions: {
            input: ['@milkdown/core', '@milkdown/plugin-prism'],
        },
        assetsDir: 'milkdown/assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        include: ['@milkdown/core', '@milkdown/plugin-prism'],
    },
};
