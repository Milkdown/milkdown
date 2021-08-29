/* Copyright 2021, Milkdown by Mirone. */
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'app',
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
        ],
    },
    plugins: [vueJsx()],
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
    },
});
