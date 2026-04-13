import type { Ctx } from '@milkdown/kit/ctx'

import { editorViewCtx, serializerCtx } from '@milkdown/kit/core'

import type { AIPromptContext } from './types'

/// Default prompt context builder. Serializes the full document and
/// the current selection (if any) as markdown, then pairs them with
/// the user instruction.
export function defaultBuildContext(
  ctx: Ctx,
  instruction: string
): AIPromptContext {
  const view = ctx.get(editorViewCtx)
  const serializer = ctx.get(serializerCtx)
  const { state } = view

  // Full document as markdown
  const document = serializer(state.doc)

  // Selected text as markdown (empty if selection is collapsed).
  // Use createAndFill because slice.content may be inline-only (e.g.
  // a selection inside a paragraph), which is not valid as a direct
  // child of the top node type.
  let selection = ''
  if (!state.selection.empty) {
    const { from, to } = state.selection
    const slice = state.doc.slice(from, to)
    const wrapper = state.doc.type.schema.topNodeType.createAndFill(
      null,
      slice.content
    )
    if (wrapper) selection = serializer(wrapper)
  }

  return { document, selection, instruction }
}
