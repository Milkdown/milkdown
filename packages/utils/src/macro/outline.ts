import type { Ctx } from '@milkdown/ctx'
import { editorViewCtx } from '@milkdown/core'

/// Get outline of the editor.
export function outline() {
  return (ctx: Ctx): Array<{ text: string; level: number; id: string }> => {
    const view = ctx.get(editorViewCtx)
    const data: { text: string; level: number; id: string }[] = []
    const doc = view.state.doc
    doc.descendants((node) => {
      if (node.type.name === 'heading' && node.attrs.level)
        data.push({
          text: node.textContent,
          level: node.attrs.level,
          id: node.attrs.id,
        })
    })
    return data
  }
}
