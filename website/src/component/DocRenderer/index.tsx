/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { prism } from '@milkdown/plugin-prism'
import { blockquoteAttr, commonmark, inlineCodeAttr, inlineCodeSchema } from '@milkdown/preset-commonmark'
import { Milkdown, MilkdownProvider, useEditor } from '@milkdown/react'
import { outline } from '@milkdown/utils'
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react'
import type { FC } from 'react'
import { useState } from 'react'
import type { Content } from '../hooks/useLazy'
import { useLazy } from '../hooks/useLazy'
import { Outline } from './Outline'

const extendedInlineCode = inlineCodeSchema.extendSchema(prev => ctx => ({
  ...prev(ctx),
  toDOM: mark => ['span', { class: 'not-prose' }, ['code', ctx.get(inlineCodeAttr.key)(mark), 0]],
}))

export const Inner: FC<{ content: Content }> = ({ content }) => {
  const [loading, md] = useLazy(content)
  const [outlines, setOutlines] = useState<{ text: string; level: number; id: string }[]>([])

  useEditor((root) => {
    if (loading || !content)
      return
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root)

        ctx.set(editorViewOptionsCtx, ({
          attributes: {
            class: 'prose w-full max-w-full box-border outline-none overflow-hidden p-4',
            spellcheck: 'false',
          },
        }))

        ctx.set(blockquoteAttr.key, () => ({
          class: 'border-l-4 border-nord10 pl-4 not-prose',
        }))

        ctx.set(inlineCodeAttr.key, () => ({
          class: 'font-mono text-nord10 tracking-tight',
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
      })
      .config((ctx) => {
        ctx.set(defaultValueCtx, md)
      })
      .use(commonmark)
      .use(extendedInlineCode)
      .use(prism)
      .use(listener)
  }, [md, loading])

  return loading
    ? <div>loading</div>
    : (
      <>
        <Milkdown />
        <div className="fixed inset-y-16 right-10 hidden flex-col gap-4 xl:flex xl:w-60">
          <Outline items={outlines} />
        </div>
      </>
      )
}

export const DocRenderer: FC<{ content: Content }> = ({ content }) => {
  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        <Inner content={content} />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  )
}
