export default {
    build: {
        commonjsOptions: {
            input: ['@milkdown/core', '@milkdown/plugin-prism'],
        },
        outDir: '../docs',
    },
    optimizeDeps: {
        include: ['@milkdown/core', '@milkdown/plugin-prism'],
    },
};
