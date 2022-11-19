/* Copyright 2021, Milkdown by Mirone. */
import { resolve } from 'path'
import { dataToEsm } from '@rollup/pluginutils'
import { build } from 'builddocs'

export const markdownPlugin = () =>
  ({
    name: 'vite-plugin-markdown',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.md'))
        return null

      // TODO: auto load for modules
      if (id.includes('core-modules') && id.includes('ctx')) {
        const markdown = build({
          name: '@milkdown/ctx',
          filename: resolve(__dirname, '../../packages/ctx/src/index.ts'),
          main: id,
          format: 'markdown',
        })

        return dataToEsm(markdown)
      }

      return dataToEsm(code)
    },
  } as const)
