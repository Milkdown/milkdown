import type { Ctx } from '@milkdown/ctx'

import { editorViewCtx, parserCtx, schemaCtx } from '@milkdown/core'
import { isTextOnlySlice } from '@milkdown/prose'
import { DOMParser, DOMSerializer, Slice } from '@milkdown/prose/model'

/// Insert markdown string into the editor.
export function insert(markdown: string, inline: boolean = false) {
  return (ctx: Ctx) => {
    const view = ctx.get(editorViewCtx)
    const parser = ctx.get(parserCtx)
    const doc = parser(markdown)
    if (!doc) return

    if (!inline) {
      const contentSlice = view.state.selection.content()
      return view.dispatch(
        view.state.tr
          .replaceSelection(
            new Slice(doc.content, contentSlice.openStart, contentSlice.openEnd)
          )
          .scrollIntoView()
      )
    }

    const schema = ctx.get(schemaCtx)
    const dom = DOMSerializer.fromSchema(schema).serializeFragment(doc.content)
    const domParser = DOMParser.fromSchema(schema)
    const slice = domParser.parseSlice(dom)
    const node = isTextOnlySlice(slice)
    if (node) {
      view.dispatch(view.state.tr.replaceSelectionWith(node, true))
      return
    }

    view.dispatch(view.state.tr.replaceSelection(slice))
  }
}
