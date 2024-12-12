import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx, schemaCtx } from '@milkdown/core'
import { DOMSerializer } from '@milkdown/prose/model'

/// Get content of the editor as HTML string.
export function getHTML() {
  return (ctx: Ctx): string => {
    const div = document.createElement('div')
    const schema = ctx.get(schemaCtx)
    const view = ctx.get(editorViewCtx)
    const fragment = DOMSerializer.fromSchema(schema).serializeFragment(
      view.state.doc.content
    )

    div.appendChild(fragment)

    return div.innerHTML
  }
}
