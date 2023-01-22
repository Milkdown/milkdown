/* Copyright 2021, Milkdown by Mirone. */
import vueJsx from '@vitejs/plugin-vue-jsx'

import { pluginViteConfig } from '../../vite.config'

export default pluginViteConfig(import.meta.url, {
  plugins: [vueJsx()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
