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
            'prosemirror-gapcursor',
            'prosemirror-history',
            'prosemirror-inputrules',
            'prosemirror-transform',
            '@benrbray/prosemirror-math',
        ],
    },
};
