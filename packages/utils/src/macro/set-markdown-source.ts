import type { Ctx } from '@milkdown/ctx'
import type { MarkdownSource } from '@milkdown/transformer'

import {
  type MarkdownSourceMeta,
  editorViewCtx,
  markdownSourceKey,
  parserCtx,
} from '@milkdown/core'
import { getParsedSource } from '@milkdown/transformer'

/// Tell the editor which markdown its document stands for, without
/// changing the document. `getMarkdown` then gives that markdown back for
/// as long as the content is the same. Pass `null` to make the editor
/// forget the markdown it has.
///
/// The editor does this on its own for a markdown `defaultValue` and for
/// `replaceAll`. Use this macro when the document comes from somewhere
/// else, for example from JSON or from a collaboration provider.
///
/// It only has an effect when `preserveSourceCtx` is on.
export function setMarkdownSource(markdown: string | null) {
  return (ctx: Ctx): void => {
    const view = ctx.get(editorViewCtx)
    let source: MarkdownSource | null = null
    if (markdown != null) {
      const doc = ctx.get(parserCtx)(markdown)
      // A parser that a plugin replaced may not record what it parsed.
      source = getParsedSource(doc) ?? { source: markdown, doc }
    }
    const meta: MarkdownSourceMeta = { source }

    view.dispatch(
      view.state.tr
        .setMeta(markdownSourceKey, meta)
        .setMeta('addToHistory', false)
    )
  }
}
