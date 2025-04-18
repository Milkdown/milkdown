import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

import { input } from './entry'

export default defineConfig({
  plugins: [vueJsx()],
  root: 'src',
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
