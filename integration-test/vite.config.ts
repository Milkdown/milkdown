import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 7000,
    },
    optimizeDeps: {
        include: [
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
            'prosemirror-schema-list',
            'prosemirror-history',
            'prosemirror-transform',
            'prosemirror-gapcursor',
            'prosemirror-dropcursor',
        ],
    },
});
