/* Copyright 2021, Milkdown by Mirone. */
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

import { markdownPlugin } from './markdown-plugin';

export default defineConfig({
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    plugins: [markdownPlugin(), reactRefresh()],
});
