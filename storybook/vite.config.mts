import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vueJsx()],
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
