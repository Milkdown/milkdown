export default {
    root: 'app',
    optimizeDeps: {
        include: [
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
        ],
        exclude: ['@milkdown/preset-commonmark'],
    },
};
