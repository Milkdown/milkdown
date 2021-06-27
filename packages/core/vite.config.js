export default {
    root: 'app',
    optimizeDeps: {
        exclude: [
            '@milkdown/preset-commonmark',
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
        ],
    },
};
