import type { Node } from '@milkdown/prose/model'

/// The markdown text that a document was parsed from.
export interface MarkdownSource {
  /// The markdown text, exactly as it was given to the parser.
  readonly source: string
  /// The document that the parser made from the text.
  readonly doc: Node
}

const sources = new WeakMap<Node, MarkdownSource>()

/// @internal
/// Remember the markdown text that `doc` was parsed from.
export function recordParsedSource(doc: Node, source: string): MarkdownSource {
  const record: MarkdownSource = { source, doc }
  sources.set(doc, record)
  return record
}

/// Get the markdown source of a document that was just parsed from
/// `markdown`. The parser of the editor records the source on its own.
/// This also records it for a parser that does not, for example one that
/// a plugin wrapped, so every way to load markdown ends up with a source.
///
/// ```typescript
/// const doc = ctx.get(parserCtx)(markdown)
/// const source = ensureParsedSource(doc, markdown)
/// ```
export function ensureParsedSource(
  doc: Node,
  markdown: string
): MarkdownSource {
  return sources.get(doc) ?? recordParsedSource(doc, markdown)
}

/// Get the markdown text that a document was parsed from.
/// It returns `undefined` for a document that did not come from the parser,
/// and for a document that was changed after it was parsed, because a
/// change makes a new document node.
///
/// ```typescript
/// const doc = parser('- a\n- b')
/// getParsedSource(doc)?.source // '- a\n- b'
/// ```
export function getParsedSource(doc: Node): MarkdownSource | undefined {
  return sources.get(doc)
}
