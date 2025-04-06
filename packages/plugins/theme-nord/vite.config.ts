import type { LibraryOptions } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { pluginViteConfig } from '@milkdown/dev/vite'

export default pluginViteConfig(import.meta.url, {
  plugins: [tailwindcss()],
  build: {
    lib: { cssFileName: 'style' } as LibraryOptions,
  },
})
