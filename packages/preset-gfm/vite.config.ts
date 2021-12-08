/* Copyright 2021, Milkdown by Mirone. */
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { defineConfig } from 'vite';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    root: 'app',
    build: {
        lib: {
            entry: resolvePath('src/index.ts'),
            name: 'milkdown_preset-gfm',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['@milkdown/core', '@milkdown/prose', '@milkdown/utils', '@milkdown/plugin-table'],
            output: {
                sourcemap: true,
                dir: resolvePath('lib'),
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    '@milkdown/core': 'milkdown_core',
                    '@milkdown/prose': 'milkdown_prose',
                    '@milkdown/utils': 'milkdown_utils',
                    '@milkdown/plugin-table': 'milkdown_plugin-table',
                },
            },
            plugins: [typescript()],
        },
    },
});
