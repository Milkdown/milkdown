import type { Node } from '@milkdown/prose/model'

/// Where a top-level block of a parsed document is in the markdown text.
export interface SourceBlock {
  /// The offset of the first character of the block. The indentation of
  /// its first line is part of the block.
  readonly from: number
  /// The offset after the last character of the block.
  readonly to: number
  /// The ids of the detached pieces of text that the block needs.
  readonly requires: readonly string[]
}

/// A piece of the markdown text at the top level that has no node in the
/// document, because a remark plugin took its node out of the tree. The
/// plugin says so with `recordDetachedSource`.
///
/// The commonmark preset does this for a link definition such as
/// `[id]: https://example.com`: it resolves every reference to the
/// definition and then removes it.
export interface DetachedSource {
  /// The offset of the first character of the piece.
  readonly from: number
  /// The offset after the last character of the piece.
  readonly to: number
  /// A name for the piece. A block that needs the piece has this id in
  /// its `requires`.
  readonly id: string
}

/// Where the parts of a parsed document are in the markdown text.
export interface SourceLayout {
  /// One entry for each top-level node of the document, in order.
  /// It is `null` when the parser cannot tell which part of the text made
  /// which node. That happens when a remark plugin adds a top-level node
  /// with no `position`, when a markdown node does not make exactly one
  /// top-level node, or when text between two blocks has no node and no
  /// plugin recorded it as detached.
  readonly blocks: readonly SourceBlock[] | null
  /// The pieces of the text that have no node in the document.
  readonly detached: readonly DetachedSource[]
}

/// The markdown text that a document was parsed from.
export interface MarkdownSource extends SourceLayout {
  /// The markdown text, exactly as it was given to the parser.
  readonly source: string
  /// The document that the parser made from the text.
  readonly doc: Node
}
