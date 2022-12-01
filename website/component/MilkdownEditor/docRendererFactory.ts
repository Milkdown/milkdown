/* Copyright 2021, Milkdown by Mirone. */

import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { outline } from '@milkdown/utils'
import { refractor } from 'refractor/lib/common'

import { iframe } from './iframe'
import type { Outline } from './Outline'

export const docRendererFactory = (
  root: HTMLElement,
  markdown: string,
  _isDarkMode: boolean,
  setOutlines: React.Dispatch<React.SetStateAction<Outline[]>>,
) => {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, markdown)
      ctx.update(editorViewOptionsCtx, prev => ({ ...prev, editable: () => false }))
      ctx.get(listenerCtx).mounted((ctx) => {
        setOutlines(outline()(ctx))
      })
      ctx.update(prismConfig.key, prev => ({
        ...prev,
        configureRefractor: () => refractor,
      }))
    })
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .use(iframe)
    .use(prism)

  return editor
}
