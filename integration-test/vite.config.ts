/* Copyright 2021, Milkdown by Mirone. */
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'src',
    build: {
        outDir: '../lib',
        emptyOutDir: true,
    },
    server: {
        port: 7000,
        fs: {
            strict: false,
        },
    },
});
