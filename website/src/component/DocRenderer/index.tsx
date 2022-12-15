/* Copyright 2021, Milkdown by Mirone. */
import { Editor, defaultValueCtx, editorViewOptionsCtx, rootCtx } from '@milkdown/core'
import { prism } from '@milkdown/plugin-prism'
import { blockquoteAttr, commonmark, inlineCodeAttr, inlineCodeSchema } from '@milkdown/preset-commonmark'
import { Milkdown, useEditor } from '@milkdown/react'
import type { FC } from 'react'
import type { Content } from '../../utils/useLazy'
import { useLazy } from '../../utils/useLazy'

const extendedInlineCode = inlineCodeSchema.extendSchema(prev => ctx => ({
  ...prev(ctx),
  toDOM: mark => ['span', { class: 'not-prose' }, ['code', ctx.get(inlineCodeAttr.key)(mark), 0]],
}))

export const DocRenderer: FC<{ content: Content }> = ({ content }) => {
  const [loading, md] = useLazy(content)

  useEditor((root) => {
    return Editor
      .make()
      .config((ctx) => {
        ctx.set(rootCtx, root)

        ctx.set(editorViewOptionsCtx, ({
          attributes: {
            class: 'prose lg:prose-xl w-full max-w-full box-border outline-none overflow-hidden p-4',
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
        ctx.set(defaultValueCtx, md)
      })
      .use(commonmark)
      .use(extendedInlineCode)
      .use(prism)
  }, [md])

  return loading ? <div>loading</div> : <Milkdown />
}
