import type { Ctx } from '@milkdown/ctx'

import {
  type MarkdownSourceMeta,
  editorViewCtx,
  markdownSourceKey,
  sourceParserCtx,
} from '@milkdown/core'

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
    // Without the plugin nobody keeps a source.
    if (!markdownSourceKey.getState(view.state)) return

    const meta: MarkdownSourceMeta = {
      source:
        markdown == null ? null : ctx.get(sourceParserCtx)(markdown).source,
    }

    view.dispatch(
      view.state.tr
        .setMeta(markdownSourceKey, meta)
        .setMeta('addToHistory', false)
    )
  }
}
