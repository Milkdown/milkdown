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

  const document = serializer(state.doc)

  // A collapsed selection serializes to an empty string. A block-level
  // selection, such as a whole paragraph or a list item, serializes
  // through a doc node that wraps the slice content. An inline-only
  // selection needs a paragraph wrapper first, because `createAndFill`
  // on the doc type returns null for inline content. The wrapper also
  // keeps a mark such as bold, italic or a link in the markdown output.
  let selection = ''
  if (!state.selection.empty) {
    const { from, to } = state.selection
    const slice = state.doc.slice(from, to)
    const { schema } = state.doc.type
    let wrapper = schema.topNodeType.createAndFill(null, slice.content)
    if (!wrapper) {
      const paragraph = schema.nodes.paragraph?.createAndFill(
        null,
        slice.content
      )
      if (paragraph) wrapper = schema.topNodeType.createAndFill(null, paragraph)
    }
    selection = wrapper ? serializer(wrapper) : state.doc.textBetween(from, to)
  }

  return { document, selection, instruction }
}
