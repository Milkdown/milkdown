import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    server: {
        port: 7000,
        fs: {
            strict: false,
        },
    },
    optimizeDeps: {
        include: [
            'prosemirror-model',
            'prosemirror-view',
            'prosemirror-state',
            'prosemirror-commands',
            'prosemirror-inputrules',
            'prosemirror-keymap',
            'prosemirror-transform',
        ],
    },
});
