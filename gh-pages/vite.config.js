export default {
    base: '/milkdown/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        include: ['@milkdown/core', '@milkdown/plugin-prism'],
    },
};
