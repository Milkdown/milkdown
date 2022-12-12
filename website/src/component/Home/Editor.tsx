/* Copyright 2021, Milkdown by Mirone. */
import { Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { Milkdown, useEditor } from '@milkdown/react'

export const HomeEditor = () => {
  useEditor((root) => {
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(editorViewOptionsCtx, ({
          attributes: {
            class: 'prose lg:prose-xl w-full max-w-full box-border outline-none overflow-hidden h-96 p-4 bg-gray-100 rounded-2xl shadow-inner border-gray-200 focus:ring-2 focus:ring-nord10',
          },
        }))
      })
      .use(commonmark)
  })

  return (
    <Milkdown />
  )
}
