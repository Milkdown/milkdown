import { pluginViteConfig } from '@milkdown/dev/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default pluginViteConfig(import.meta.url, {
  plugins: [vueJsx()],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
