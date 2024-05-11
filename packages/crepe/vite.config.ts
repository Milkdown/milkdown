import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { libFileName } from '../../vite.config.mjs'

const dir = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(dir, 'src', 'index.ts'),
      name: `milkdown_crepe`,
      fileName: libFileName,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        dir: resolve(dir, 'lib'),
      },
    },
  },
})
