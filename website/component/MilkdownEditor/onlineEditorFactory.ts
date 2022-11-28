/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { clipboard } from '@milkdown/plugin-clipboard'
import { cursor } from '@milkdown/plugin-cursor'
import { emoji } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math } from '@milkdown/plugin-math'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { trailing } from '@milkdown/plugin-trailing'
import { upload } from '@milkdown/plugin-upload'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { refractor } from 'refractor/lib/common'

export const onlineEditorFactory = (
  root: HTMLElement | null,
  defaultValue: string,
  readOnly: boolean | undefined,
  onChange?: (markdown: string) => void,
) => {
  const editor = Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, defaultValue)
      ctx.update(editorViewOptionsCtx, prev => ({ ...prev, editable: () => !readOnly }))
      ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
        onChange?.(markdown)
      })
      ctx.update(prismConfig.key, prev => ({
        ...prev,
        configureRefractor: () => refractor,
      }))
    })
    .use(emoji)
    .use(commonmark)
    .use(gfm)
    .use(listener)
    .use(clipboard)
    .use(history)
    .use(cursor)
    .use(prism)
    .use(math)
    .use(indent)
    .use(upload)
    .use(trailing)

  return editor
}
