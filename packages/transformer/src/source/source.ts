import type { Node } from '@milkdown/prose/model'

/// The markdown text that a document was parsed from.
export interface MarkdownSource {
  /// The markdown text, exactly as it was given to the parser.
  readonly source: string
  /// The document that the parser made from the text.
  readonly doc: Node
}
