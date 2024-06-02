import vueJsx from '@vitejs/plugin-vue-jsx'

import { pluginViteConfig } from '../../../vite.config.mjs'

export default pluginViteConfig(import.meta.url, {
  plugins: [vueJsx()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
