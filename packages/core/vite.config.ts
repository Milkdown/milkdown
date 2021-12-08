/* Copyright 2021, Milkdown by Mirone. */
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { defineConfig } from 'vite';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: resolvePath('src/index.ts'),
            name: 'milkdown_core',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                '@milkdown/ctx',
                '@milkdown/transformer',
                '@milkdown/design-system',
                '@milkdown/exception',
                '@milkdown/prose',
            ],
            output: {
                dir: resolvePath('lib'),
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    '@milkdown/ctx': 'milkdown_ctx',
                    '@milkdown/transformer': 'milkdown_transformer',
                    '@milkdown/design-system': 'milkdown_design-system',
                    '@milkdown/exception': 'milkdown_exception',
                    '@milkdown/prose': 'milkdown_prose',
                },
            },
            plugins: [typescript()],
        },
    },
});
