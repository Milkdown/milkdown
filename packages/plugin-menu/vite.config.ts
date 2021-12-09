/* Copyright 2021, Milkdown by Mirone. */
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { defineConfig } from 'vite';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    root: 'app',
    build: {
        sourcemap: true,
        lib: {
            entry: resolvePath('src/index.ts'),
            name: 'milkdown_plugin-menu',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                '@milkdown/core',
                '@milkdown/prose',
                '@milkdown/utils',
                '@milkdown/preset-gfm',
                '@milkdown/design-system',
                '@milkdown/plugin-history',
                '@emotion/css',
            ],
            output: {
                dir: resolvePath('lib'),
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    '@milkdown/core': 'milkdown_core',
                    '@milkdown/prose': 'milkdown_prose',
                    '@milkdown/utils': 'milkdown_utils',
                    '@milkdown/preset-gfm': 'milkdown_preset-gfm',
                    '@milkdown/design-system': 'milkdown_design-system',
                    '@milkdown/plugin-history': 'milkdown_plugin-history',
                    '@emotion/css': 'emotion',
                },
            },
            plugins: [typescript()],
        },
    },
});
