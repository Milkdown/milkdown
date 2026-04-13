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
  // For block-level selections (whole paragraphs, list items, etc.)
  // we wrap the slice content in a doc node and serialize it. For
  // inline-only selections (text inside a single paragraph),
  // createAndFill returns null because inline content isn't valid as
  // direct doc children — fall back to plain text via textBetween.
  let selection = ''
  if (!state.selection.empty) {
    const { from, to } = state.selection
    const slice = state.doc.slice(from, to)
    const wrapper = state.doc.type.schema.topNodeType.createAndFill(
      null,
      slice.content
    )
    selection = wrapper ? serializer(wrapper) : state.doc.textBetween(from, to)
  }

  return { document, selection, instruction }
}
