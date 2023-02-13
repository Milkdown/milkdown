/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism, prismConfig } from '@milkdown/plugin-prism'
import { blockquoteAttr, commonmark, inlineCodeAttr } from '@milkdown/preset-commonmark'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { nord } from '@milkdown/theme-nord'
import { outline } from '@milkdown/utils'
import { ProsemirrorAdapterProvider, useWidgetViewFactory } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { useState } from 'react'
import markdown from 'refractor/lang/markdown'
import css from 'refractor/lang/css'
import javascript from 'refractor/lang/javascript'
import typescript from 'refractor/lang/typescript'
import jsx from 'refractor/lang/jsx'
import tsx from 'refractor/lang/tsx'
import type { Content } from '../hooks/useLazy'
import { useLazy } from '../hooks/useLazy'
import { linkPlugin } from './LinkWidget'
import { headingAnchorPlugin } from './HeadingWidget'
import { Outline } from './Outline'

export const Inner: FC<{ content: Content }> = ({ content }) => {
  const [loading, md] = useLazy(content)
  const [outlines, setOutlines] = useState<{ text: string; level: number; id: string }[]>([])
  const widgetViewFactory = useWidgetViewFactory()

  useEditor((root) => {
    if (loading || !content)
      return
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root)

        ctx.set(editorViewOptionsCtx, ({
          attributes: {
            class: 'w-full max-w-full box-border overflow-hidden p-4',
            spellcheck: 'false',
          },
        }))

        ctx.set(blockquoteAttr.key, () => ({
          class: 'border-l-4 border-nord10 pl-4 not-prose dark:border-nord8',
        }))

        ctx.set(inlineCodeAttr.key, () => ({
          class: 'font-mono text-nord10 tracking-tight dark:text-nord8',
        }))

        ctx.get(listenerCtx)
          .mounted((ctx) => {
            setOutlines(outline()(ctx))
          })
          .markdownUpdated((ctx) => {
            const view = ctx.get(editorViewCtx)
            if (view.state?.doc)
              setOutlines(outline()(ctx))
          })

        ctx.set(prismConfig.key, {
          configureRefractor: (refractor) => {
            refractor.register(markdown)
            refractor.register(css)
            refractor.register(javascript)
            refractor.register(typescript)
            refractor.register(jsx)
            refractor.register(tsx)
          },
        })
      })
      .config((ctx) => {
        ctx.set(defaultValueCtx, md)
      })
      .config(nord)
      .use(commonmark)
      .use(prism)
      .use(linkPlugin(widgetViewFactory))
      .use(headingAnchorPlugin(widgetViewFactory))
      .use(listener)
  }, [md, loading])

  return loading
    ? <div>loading</div>
    : (
      <>
        <Milkdown />
        <div className="fixed inset-y-16 right-10 hidden flex-col gap-4 overflow-y-auto xl:flex xl:w-60">
          <Outline items={outlines} />
        </div>
      </>
      )
}

export const DocRenderer: FC<{ content: Content }> = ({ content }) => {
  return (
    <div className="mx-8 pt-16 md:mx-24 lg:mx-40 xl:mx-80">
      <MilkdownProvider>
        <ProsemirrorAdapterProvider>
          <Inner content={content} />
        </ProsemirrorAdapterProvider>
      </MilkdownProvider>
    </div>
  )
}
