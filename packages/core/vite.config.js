export default {
    root: 'app',
    optimizeDeps: {
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
