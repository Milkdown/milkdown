/* Copyright 2021, Milkdown by Mirone. */
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [vueJsx(), vue()],
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
    },
});
