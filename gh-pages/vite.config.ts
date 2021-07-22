import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { markdownPlugin } from './markdown-plugin';

export default defineConfig({
    base: '/milkdown/',
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
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
    plugins: [markdownPlugin(), reactRefresh()],
});
