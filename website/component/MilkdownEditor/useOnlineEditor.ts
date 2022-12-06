/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { block, blockView } from '@milkdown/plugin-block'
import { clipboard } from '@milkdown/plugin-clipboard'
import { cursor } from '@milkdown/plugin-cursor'
import { diagram } from '@milkdown/plugin-diagram'
import { emoji } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math } from '@milkdown/plugin-math'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { slash } from '@milkdown/plugin-slash'
import { trailing } from '@milkdown/plugin-trailing'
import { upload } from '@milkdown/plugin-upload'
import { codeBlockSchema, commonmark, listItemSchema } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { useEditor } from '@milkdown/react'
import { $view } from '@milkdown/utils'
import { useNodeViewFactory, usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/react'
import { refractor } from 'refractor/lib/common'
import { Block } from './EditorComponent/Block'
import { CodeBlock } from './EditorComponent/CodeBlock'
import { nordPlugins, nordThemeConfig } from './EditorComponent/config'
import { ImageTooltip, imageTooltip } from './EditorComponent/ImageTooltip'
import { linkPlugin } from './EditorComponent/LinkWidget'
import { ListItem } from './EditorComponent/ListItem'
import { Slash } from './EditorComponent/Slash'
import { TableTooltip, tableSelectorPlugin, tableTooltip, tableTooltipCtx } from './EditorComponent/TableWidget'

export const useOnlineEditorFactory = (
  defaultValue: string,
  readOnly: boolean | undefined,
  onChange?: (markdown: string) => void,
) => {
  const pluginViewFactory = usePluginViewFactory()
  const nodeViewFactory = useNodeViewFactory()
  const widgetViewFactory = useWidgetViewFactory()

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
        ctx.set(imageTooltip.key, {
          view: pluginViewFactory({
            component: ImageTooltip,
          }),
        })
        ctx.set(slash.key, {
          view: pluginViewFactory({
            component: Slash,
          }),
        })
        ctx.set(blockView.key, pluginViewFactory({
          component: Block,
        }))
        ctx.set(tableTooltip.key, {
          view: pluginViewFactory({
            component: TableTooltip,
          }),
        })
      })
      .config(nordThemeConfig)
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
      .use(imageTooltip)
      .use(slash)
      .use(block)
      .use(diagram)
      .use(nordPlugins)
      .use($view(listItemSchema.node, () => nodeViewFactory({ component: ListItem })))
      .use($view(codeBlockSchema.node, () => nodeViewFactory({ component: CodeBlock })))
      .use(linkPlugin(widgetViewFactory))
      .use(tableTooltipCtx)
      .use(tableTooltip)
      .use(tableSelectorPlugin(widgetViewFactory))

    return editor
  }, [readOnly, defaultValue, onChange, pluginViewFactory])

  return editorInfo
}
