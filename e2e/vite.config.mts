import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { input } from './entry'

export default defineConfig({
  root: 'src',
  plugins: [tailwindcss()],
  build: {
    outDir: '../lib',
    emptyOutDir: true,
    rollupOptions: { input },
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
