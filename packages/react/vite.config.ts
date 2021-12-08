/* Copyright 2021, Milkdown by Mirone. */
import typescript from '@rollup/plugin-typescript';
import reactRefresh from '@vitejs/plugin-react-refresh';
import path from 'path';
import { defineConfig } from 'vite';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    root: 'app',
    plugins: [reactRefresh()],
    build: {
        lib: {
            entry: resolvePath('src/index.ts'),
            name: 'milkdown_react',
            fileName: (format) => `index.${format}.js`,
        },
        sourcemap: true,
        rollupOptions: {
            external: ['@milkdown/core', '@milkdown/prose', '@milkdown/utils', 'react', 'react-dom'],
            output: {
                dir: resolvePath('lib'),
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    '@milkdown/core': 'milkdown_core',
                    '@milkdown/prose': 'milkdown_prose',
                    '@milkdown/utils': 'milkdown_utils',
                    react: 'React',
                    'react-dom': 'reactDOM',
                },
            },
            plugins: [typescript()],
        },
    },
});
