/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx, MilkdownPlugin } from '@milkdown/ctx'
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { block, blockView } from '@milkdown/plugin-block'
import { clipboard } from '@milkdown/plugin-clipboard'
import { cursor } from '@milkdown/plugin-cursor'
import { diagram, diagramSchema } from '@milkdown/plugin-diagram'
import { emoji, emojiAttr } from '@milkdown/plugin-emoji'
import { history } from '@milkdown/plugin-history'
import { indent } from '@milkdown/plugin-indent'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { math, mathBlockSchema } from '@milkdown/plugin-math'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { slashFactory } from '@milkdown/plugin-slash'
import { trailing } from '@milkdown/plugin-trailing'
import { upload } from '@milkdown/plugin-upload'
import { codeBlockSchema, commonmark, listItemSchema } from '@milkdown/preset-commonmark'
import { footnoteDefinitionSchema, footnoteReferenceSchema, gfm } from '@milkdown/preset-gfm'
import { useEditor } from '@milkdown/react'
import { nord } from '@milkdown/theme-nord'
import { $view, getMarkdown } from '@milkdown/utils'
import { useNodeViewFactory, usePluginViewFactory, useWidgetViewFactory } from '@prosemirror-adapter/react'
import debounce from 'lodash.debounce'
import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { refractor } from 'refractor/lib/common'
import { useToast } from '../../Toast'
import { Block } from '../EditorComponent/Block'
import { CodeBlock } from '../EditorComponent/CodeBlock'
import { Diagram } from '../EditorComponent/Diagram'
import { FootnoteDef, FootnoteRef } from '../EditorComponent/Footnote'
import { ImageTooltip, imageTooltip } from '../EditorComponent/ImageTooltip'
import { linkPlugin } from '../EditorComponent/LinkWidget'
import { ListItem } from '../EditorComponent/ListItem'
import { MathBlock } from '../EditorComponent/MathBlock'
import { Slash } from '../EditorComponent/Slash'
import { TableTooltip, tableSelectorPlugin, tableTooltip, tableTooltipCtx } from '../EditorComponent/TableWidget'
import { encode } from '../Share/share'
import { useSetShare } from '../Share/ShareProvider'
import { useFeatureToggle } from './FeatureToggleProvider'
import { useSetProseState } from './ProseStateProvider'

const useToggle = (label: string, state: boolean, get: () => Editor | undefined, plugins: MilkdownPlugin[]) => {
  const ref = useRef(state)
  useEffect(() => {
    const effect = async () => {
      const editor = get()
      if (!editor || ref.current === state)
        return

      if (!state) {
        await editor.remove(plugins)
        ref.current = false
      }
      else {
        editor.use(plugins)
        ref.current = true
      }

      await editor.create()
    }

    effect().catch((e) => {
      console.error('Error run toggle for: ', label)
      console.error(e)
    })
  }, [get, label, plugins, state])
}

const slash = slashFactory('MILKDOWN')

export const usePlayground = (
  defaultValue: string,
  onChange: (markdown: string) => void,
) => {
  const pluginViewFactory = usePluginViewFactory()
  const nodeViewFactory = useNodeViewFactory()
  const widgetViewFactory = useWidgetViewFactory()
  const setProseState = useSetProseState()
  const setShare = useSetShare()
  const toast = useToast()
  const defaultValueRef = useRef(defaultValue)
  const {
    enableGFM,
    enableMath,
    enableDiagram,
    enableBlockHandle,
    enableTwemoji,
  } = useFeatureToggle()

  const gfmPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      gfm,
      tableTooltip,
      tableTooltipCtx,
      (ctx: Ctx) => async () => {
        ctx.set(tableTooltip.key, {
          view: pluginViewFactory({
            component: TableTooltip,
          }),
        })
      },
      $view(footnoteDefinitionSchema.node, () => nodeViewFactory({ component: FootnoteDef })),
      $view(footnoteReferenceSchema.node, () => nodeViewFactory({ component: FootnoteRef })),
      tableSelectorPlugin(widgetViewFactory),
    ].flat()
  }, [nodeViewFactory, pluginViewFactory, widgetViewFactory])

  const mathPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      $view(mathBlockSchema.node, () => nodeViewFactory({
        component: MathBlock,
        stopEvent: () => true,
      })),
      math,
    ].flat()
  }, [nodeViewFactory])

  const diagramPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      diagram,
      $view(diagramSchema.node, () => nodeViewFactory({
        component: Diagram,
        stopEvent: () => true,
      })),
    ].flat()
  }, [nodeViewFactory])

  const blockPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      block,
      (ctx: Ctx) => () => {
        ctx.set(blockView.key, pluginViewFactory({
          component: Block,
        }))
      },
    ].flat()
  }, [pluginViewFactory])

  const twemojiPlugins: MilkdownPlugin[] = useMemo(() => {
    return [
      emoji,
      (ctx: Ctx) => () => {
        ctx.set(emojiAttr.key, () => ({
          span: {},
          img: {
            class: 'w-[1em] h-[1em] !m-0 inline-block mr-px align-text-top',
          },
        }))
      },
    ].flat()
  }, [])

  const editorInfo = useEditor((root) => {
    const editor = Editor
      .make()
      .config((ctx) => {
        ctx.update(editorViewOptionsCtx, prev => ({
          ...prev,
          attributes: {
            class: 'mx-auto p-1 box-border',
          },
        }))
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, defaultValueRef.current)
        ctx.get(listenerCtx)
          .markdownUpdated((_, markdown) => {
            debounce(onChange, 500)(markdown)
          }).updated((_, doc) => {
            debounce(setProseState, 500)(doc.toJSON())
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
      })
      .config(nord)
      .use(commonmark)
      .use(linkPlugin(widgetViewFactory))
      .use(listener)
      .use(clipboard)
      .use(history)
      .use(cursor)
      .use(prism)
      .use(indent)
      .use(upload)
      .use(trailing)
      .use(imageTooltip)
      .use(slash)
      .use($view(listItemSchema.node, () => nodeViewFactory({ component: ListItem })))
      .use($view(codeBlockSchema.node, () => nodeViewFactory({ component: CodeBlock })))
      .use(gfmPlugins)
      .use(mathPlugins)
      .use(diagramPlugins)
      .use(blockPlugins)
      .use(twemojiPlugins)

    return editor
  }, [onChange])

  const { get } = editorInfo

  useEffect(() => {
    onChange(defaultValue)
  }, [defaultValue, onChange])

  useToggle('GFM', enableGFM, get, gfmPlugins)
  useToggle('Math', enableMath, get, mathPlugins)
  useToggle('Diagram', enableDiagram, get, diagramPlugins)
  useToggle('BlockHandle', enableBlockHandle, get, blockPlugins)
  useToggle('Twemoji', enableTwemoji, get, twemojiPlugins)

  const [_, setSearchParams] = useSearchParams()

  useEffect(() => {
    setShare(() => () => {
      const editor = get()
      if (!editor)
        return

      const content = editor.action(getMarkdown())
      const base64 = encode(content)

      if (base64.length > 2000) {
        console.warn('Share content is too long.')
        toast('Content is too long to share', 'warning')
        return
      }

      const url = new URL(location.href)
      url.searchParams.set('text', base64)
      navigator.clipboard.writeText(url.toString())
      toast('Share link copied.', 'success')
      setSearchParams({ text: base64 })
    })
  }, [get, setSearchParams, setShare, toast])

  return editorInfo
}
