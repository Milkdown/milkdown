import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const dir = dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  build: {
    cssCodeSplit: true,
    lib: {
      entry: resolve(dir, 'src', 'index.ts'),
      name: `milkdown_crepe`,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        dir: resolve(dir, 'lib'),
      },
    },
  },
})
