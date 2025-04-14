import type { LibraryOptions } from 'vite'

import { pluginViteConfig } from '@milkdown/dev/vite'
import tailwindcss from '@tailwindcss/vite'

export default pluginViteConfig(import.meta.url, {
  plugins: [tailwindcss()],
  build: {
    lib: { cssFileName: 'style' } as LibraryOptions,
  },
})
