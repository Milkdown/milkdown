/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { block, blockView } from '@milkdown/plugin-block'
import { clipboard } from '@milkdown/plugin-clipboard'
import { cursor } from '@milkdown/plugin-cursor'
import { emoji } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math } from '@milkdown/plugin-math'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { slash } from '@milkdown/plugin-slash'
import { tooltip } from '@milkdown/plugin-tooltip'
import { trailing } from '@milkdown/plugin-trailing'
import { upload } from '@milkdown/plugin-upload'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { useEditor } from '@milkdown/react'
import { usePluginViewFactory } from '@prosemirror-adapter/react'
import { refractor } from 'refractor/lib/common'
import { Block } from './Block'
import { Slash } from './Slash'
import { Tooltip } from './Tooltip'

export const useOnlineEditorFactory = (
  defaultValue: string,
  readOnly: boolean | undefined,
  onChange?: (markdown: string) => void,
) => {
  const pluginViewFactory = usePluginViewFactory()

  const editorInfo = useEditor((root) => {
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
        ctx.set(tooltip.key, pluginViewFactory({
          component: Tooltip,
        }))
        ctx.set(slash.key, pluginViewFactory({
          component: Slash,
        }))
        ctx.set(blockView.key, pluginViewFactory({
          component: Block,
        }))
      })
      .use(commonmark)
      .use(gfm)
      .use(emoji)
      .use(listener)
      .use(clipboard)
      .use(history)
      .use(cursor)
      .use(prism)
      .use(math)
      .use(indent)
      .use(upload)
      .use(trailing)
      .use(tooltip)
      .use(slash)
      .use(block)

    return editor
  }, [readOnly, defaultValue, onChange, pluginViewFactory])

  return editorInfo
}
