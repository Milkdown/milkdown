export default {
    root: 'app',
    optimizeDeps: {
        include: ['@milkdown/preset-commonmark'],
        exclude: [
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
        ],
    },
};
