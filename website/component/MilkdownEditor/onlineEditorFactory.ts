/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { block } from '@milkdown/plugin-block'
import { clipboard } from '@milkdown/plugin-clipboard'
import { cursor } from '@milkdown/plugin-cursor'
import { diagram } from '@milkdown/plugin-diagram'
import { emoji } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math } from '@milkdown/plugin-math'
import { menu } from '@milkdown/plugin-menu'
import { prismPlugin } from '@milkdown/plugin-prism'
import { slash } from '@milkdown/plugin-slash'
import { tooltip } from '@milkdown/plugin-tooltip'
import { trailing } from '@milkdown/plugin-trailing'
import { upload } from '@milkdown/plugin-upload'
import { gfm } from '@milkdown/preset-gfm'
import { nord } from '@milkdown/theme-nord'
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
    })
    .use(emoji)
    .use(gfm)
    .use(listener)
    .use(clipboard)
    .use(history)
    .use(cursor)
    .use(
      prismPlugin({
        configureRefractor: () => refractor,
      }),
    )
    .use(math)
    .use(indent)
    .use(upload)
    .use(diagram)
    .use(tooltip)
    .use(slash)
    .use(nord)
    .use(trailing)
    .use(block)
    .use(menu)

  return editor
}
