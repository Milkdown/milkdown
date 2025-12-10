import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: '../lib',
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
