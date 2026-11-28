import type { MarkdownSource } from '@milkdown/transformer'

import { createSlice } from '@milkdown/ctx'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import { getParsedSource } from '@milkdown/transformer'

/// A slice which turns on source preservation. It is `false` by default.
///
/// The serializer normalizes what it writes: `- a` becomes `* a`, a table
/// gets padded, a reference link becomes an inline link. With this slice
/// set to `true`, the editor remembers the markdown that the document was
/// loaded from, and `getMarkdown` and the `markdownUpdated` listener give
/// that markdown back for as long as the content is the same.
///
/// The editor reads this slice once, when it creates the editor state.
/// Set it in `editor.config`:
///
/// ```typescript
/// Editor.make().config((ctx) => {
///   ctx.set(preserveSourceCtx, true)
/// })
/// ```
export const preserveSourceCtx = createSlice(false, 'preserveSource')

/// The markdown sources that an editor state keeps for its document.
export interface MarkdownSourceState {
  /// The markdown that the document was last loaded from.
  readonly current: MarkdownSource | null
  /// The markdown that the document was loaded from before that. An undo
  /// can bring that document back.
  readonly previous: MarkdownSource | null
}

/// The transaction meta that replaces the markdown source of a document.
/// Set it with `markdownSourceKey` as the key. A `source` of `null` makes
/// the editor forget every source.
///
/// ```typescript
/// tr.setMeta(markdownSourceKey, { source: getParsedSource(doc) ?? null })
/// ```
export interface MarkdownSourceMeta {
  source: MarkdownSource | null
}

/// The key of the prosemirror plugin that keeps the markdown sources.
/// The plugin exists only when `preserveSourceCtx` is `true`.
///
/// ```typescript
/// const sources = markdownSourceKey.getState(view.state)
/// ```
export const markdownSourceKey = new PluginKey<MarkdownSourceState>(
  'MILKDOWN_MARKDOWN_SOURCE'
)

const none: MarkdownSourceState = { current: null, previous: null }

/// @internal
/// The plugin only holds state. It never changes the document.
export function createMarkdownSourcePlugin() {
  return new Plugin<MarkdownSourceState>({
    key: markdownSourceKey,
    state: {
      init: (_, instance) => {
        const current = getParsedSource(instance.doc)
        return current ? { current, previous: null } : none
      },
      apply: (tr, value) => {
        const meta = tr.getMeta(markdownSourceKey) as
          | MarkdownSourceMeta
          | undefined
        if (!meta) return value
        if (!meta.source) return none
        return { current: meta.source, previous: value.current }
      },
    },
  })
}
