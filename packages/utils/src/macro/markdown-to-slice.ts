import type { Ctx } from '@milkdown/ctx'

import { parserCtx, schemaCtx } from '@milkdown/core'
import { DOMSerializer, DOMParser } from '@milkdown/prose/model'

/// Convert markdown string to slice.
export function markdownToSlice(markdown: string) {
  return (ctx: Ctx) => {
    const parser = ctx.get(parserCtx)
    const doc = parser(markdown)
    const schema = ctx.get(schemaCtx)
    const dom = DOMSerializer.fromSchema(schema).serializeFragment(doc.content)
    const domParser = DOMParser.fromSchema(schema)
    const slice = domParser.parseSlice(dom)

    return slice
  }
}
