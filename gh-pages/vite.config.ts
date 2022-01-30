/* Copyright 2021, Milkdown by Mirone. */
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';

import { markdownPlugin } from './markdown-plugin';

export default defineConfig({
    build: {
        assetsDir: 'assets',
        outDir: '../docs',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            chalk: path.join(__dirname, 'chalk.js'),
        },
    },
    plugins: [
        markdownPlugin(),
        reactRefresh(),
        copy({
            targets: [
                {
                    src: [path.resolve(__dirname, '404.html')],
                    dest: path.resolve(__dirname, '../docs'),
                },
            ],
            hook: 'writeBundle',
        }),
    ],
});
