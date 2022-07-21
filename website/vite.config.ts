/* Copyright 2021, Milkdown by Mirone. */
import react from '@vitejs/plugin-react';
import { join, resolve } from 'pathe';
import copy from 'rollup-plugin-copy';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

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
            chalk: join(__dirname, 'chalk.js'),
        },
    },
    plugins: [
        VitePWA({ registerType: 'autoUpdate' }),
        sitemapPlugin(),
        markdownPlugin(),
        react(),
        copy({
            targets: [
                {
                    src: [resolve(__dirname, '404.html')],
                    dest: resolve(__dirname, '../docs'),
                },
            ],
            hook: 'writeBundle',
        }),
    ],
});
