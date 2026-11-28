import type { Node } from '@milkdown/prose/model'
import type { MarkdownSource } from '@milkdown/transformer'

import { createSlice } from '@milkdown/ctx'
import { ctxCallOutOfScope } from '@milkdown/exception'
import { Plugin, PluginKey } from '@milkdown/prose/state'

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
/// const { doc, source } = ctx.get(sourceParserCtx)(markdown)
/// tr.setMeta(markdownSourceKey, { source })
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

/// What the source parser gives for a markdown text.
export interface ParsedMarkdown {
  /// The document, the same one that the parser in `parserCtx` gives.
  doc: Node
  /// The markdown source of the document. It is `null` when source
  /// preservation is off, and for an input that is not a string.
  source: MarkdownSource | null
}

/// The source parser type. It parses markdown the way the parser in
/// `parserCtx` does, and it also tells the markdown source of the result.
export type SourceParser = (markdown: string) => ParsedMarkdown

const outOfScope = (() => {
  throw ctxCallOutOfScope()
}) as SourceParser

/// A slice which contains the source parser. Use it instead of the parser
/// in `parserCtx` to load markdown into the editor in a way of your own,
/// when the editor should keep that markdown.
///
/// The sources belong to one editor. Another editor on the same page has
/// a source parser and sources of its own.
///
/// ```typescript
/// const { doc, source } = ctx.get(sourceParserCtx)(markdown)
/// view.dispatch(
///   view.state.tr
///     .replace(0, view.state.doc.content.size, new Slice(doc.content, 0, 0))
///     .setMeta(markdownSourceKey, { source })
/// )
/// ```
export const sourceParserCtx = createSlice<SourceParser, 'sourceParser'>(
  outOfScope,
  'sourceParser'
)

const none: MarkdownSourceState = { current: null, previous: null }

/// @internal
/// The plugin only holds state. It never changes the document. `sources`
/// has the markdown of the documents that this editor parsed.
export function createMarkdownSourcePlugin(
  sources: WeakMap<Node, MarkdownSource>
) {
  return new Plugin<MarkdownSourceState>({
    key: markdownSourceKey,
    state: {
      init: (_, instance) => {
        const current = sources.get(instance.doc)
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
