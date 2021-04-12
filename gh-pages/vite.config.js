export default {
    base: '/milkdown/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    optimizeDeps: {
        exclude: [
            '@milkdown/core',
            '@milkdown/plugin-prism',
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
            'prosemirror-schema-list',
        ],
    },
};
