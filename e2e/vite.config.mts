import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { cases } from './src/data'

const data = cases.reduce((acc, { link }) => {
  const name = link.match(/[\w-]+/)?.[0] as string
  return {
    ...acc,
    [name]: resolve(__dirname, `src${link}index.html`),
  }
}, {} as Record<string, string>)

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../lib',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        ...data,
      },
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
})
