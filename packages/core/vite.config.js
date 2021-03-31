export default {
    root: 'app',
    optimizeDeps: {
        exclude: [
            'index',
            'editor',
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
        ],
    },
};
