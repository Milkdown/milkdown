import type { Ctx } from '@milkdown/ctx'
import type { ParseResult } from '@milkdown/transformer'

import { remarkCtx, schemaCtx } from '@milkdown/core'
import { ParserState } from '@milkdown/transformer'

/// Parse a markdown string without touching the editor. Next to the
/// document it gives the markdown tree and the place of each top-level
/// node of the document in the string.
///
/// ```typescript
/// const { doc, ast, blocks } = editor.action(parseMarkdown(markdown))
/// if (blocks) {
///   const { from, to } = blocks[0]
///   markdown.slice(from, to) // the text of doc.child(0)
/// }
/// ```
export function parseMarkdown(markdown: string) {
  return (ctx: Ctx): ParseResult =>
    new ParserState(ctx.get(schemaCtx))
      .run(ctx.get(remarkCtx), markdown)
      .toResult()
}
