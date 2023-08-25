/* Copyright 2021, Milkdown by Mirone. */
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  resolve: {
    dedupe: ['@codemirror/state', '@codemirror/view'],
  },
  build: {
    outDir: '../lib',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'main': resolve(__dirname, 'src/index.html'),
        'preset-gfm': resolve(__dirname, 'src/preset-gfm/index.html'),
        'preset-commonmark': resolve(__dirname, 'src/preset-commonmark/index.html'),
        'plugin-clipboard': resolve(__dirname, 'src/plugin-clipboard/index.html'),
        'plugin-math': resolve(__dirname, 'src/plugin-math/index.html'),
        'plugin-listener': resolve(__dirname, 'src/plugin-listener/index.html'),
        'multi-editor': resolve(__dirname, 'src/multi-editor/index.html'),
        'image-block': resolve(__dirname, 'src/image-block/index.html'),
        'code-block': resolve(__dirname, 'src/code-block/index.html'),
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
