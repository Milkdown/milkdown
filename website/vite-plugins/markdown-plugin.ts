/* Copyright 2021, Milkdown by Mirone. */
import { basename, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { dataToEsm } from '@rollup/pluginutils'
import { build } from 'builddocs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const markdownPlugin = () =>
  ({
    name: 'vite-plugin-markdown',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.md'))
        return null

      const dir = dirname(id)

      if (/\/api\//.test(id)) {
        const packageDirName = basename(dir)
        const name = `@milkdown/${packageDirName}`
        const filename = resolve(__dirname, `../../packages/${packageDirName}/src/index.ts`)
        const markdown = build({
          name,
          filename,
          main: id,
          format: 'markdown',
        })

        return dataToEsm(markdown)
      }

      return dataToEsm(code)
    },
  } as const)
