import type { LibraryOptions } from 'vite'
import { pluginViteConfig } from '../../../vite.config.mjs'

export default pluginViteConfig(import.meta.url, {
  build: {
    lib: { cssFileName: 'style' } as LibraryOptions,
  },
})
