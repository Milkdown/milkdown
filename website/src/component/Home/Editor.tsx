/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { prism } from '@milkdown/plugin-prism'
import { blockquoteAttr, commonmark, inlineCodeAttr, inlineCodeSchema } from '@milkdown/preset-commonmark'
import { Milkdown, useEditor } from '@milkdown/react'
import { nord } from '@milkdown/theme-nord'
import doc from './home.md'

const extendedInlineCode = inlineCodeSchema.extendSchema((prev) => {
  return (ctx) => {
    return {
      ...prev(ctx),
      toDOM: mark => ['span', { class: 'not-prose' }, ['code', ctx.get(inlineCodeAttr.key)(mark), 0]],
    }
  }
})

export const HomeEditor = () => {
  useEditor((root) => {
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        root.className = 'h-96 overflow-auto bg-gray-100 rounded-2xl shadow-inner border-gray-200 dark:bg-gray-800 dark:border-gray-700'

        ctx.set(editorViewOptionsCtx, ({
          attributes: {
            class: 'w-full max-w-full box-border overflow-hidden p-4',
          },
        }))

        ctx.set(blockquoteAttr.key, () => ({
          class: 'border-l-4 border-nord10 pl-4',
        }))

        ctx.set(inlineCodeAttr.key, () => ({
          class: 'font-mono text-nord10',
        }))
      })
      .config((ctx) => {
        ctx.set(defaultValueCtx, doc)
      })
      .config(nord)
      .use(commonmark)
      .use(extendedInlineCode)
      .use(prism)
  })

  return <Milkdown />
}
