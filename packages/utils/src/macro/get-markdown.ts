/* Copyright 2021, Milkdown by Mirone. */
import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx, serializerCtx } from '@milkdown/core'

/// Get content of the editor as markdown string.
export const getMarkdown
  = () =>
    (ctx: Ctx): string => {
      const view = ctx.get(editorViewCtx)
      const serializer = ctx.get(serializerCtx)

      return serializer(view.state.doc)
    }
