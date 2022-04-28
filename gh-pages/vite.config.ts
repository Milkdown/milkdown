/* Copyright 2021, Milkdown by Mirone. */
import react from '@vitejs/plugin-react';
import path from 'path';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';

import { markdownPlugin } from './vite-plugins/markdown-plugin';
import { sitemapPlugin } from './vite-plugins/sitemap-plugin';

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
        sitemapPlugin(),
        markdownPlugin(),
        react(),
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
