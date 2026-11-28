import type { MarkType, Node, NodeType } from '@milkdown/prose/model'

import type { SourceLayout } from '../source'
import type { MarkdownNode } from '../utility/types'
import type { ParserState } from './state'

/// The parser type which is used to transform markdown text into prosemirror
/// node.
export type Parser = (text: string) => Node

/// What `ParserState.toResult` gives: the document, the markdown tree it
/// was made from, and where each part of the document is in the text.
export interface ParseResult extends SourceLayout {
  /// The document.
  doc: Node
  /// The markdown tree after the remark plugins ran. Its nodes have a
  /// `position` in the markdown text. As in remark, these positions do not
  /// count a byte order mark at the start of the text, while `blocks` and
  /// `detached` do. It is `null` when the state did not `run` on a
  /// text.
  ast: MarkdownNode | null
}

/// The spec for node parser in schema.
export interface NodeParserSpec {
  /// The match function to check if the node is the target node.
  /// For example:
  ///
  /// ```typescript
  /// match: (node) => node.type === 'paragraph'
  /// ```
  match: (node: MarkdownNode) => boolean
  /// The runner function to transform the node into prosemirror node.
  /// Generally, you should call methods in `state` to add node to state.
  /// For example:
  ///
  /// ```typescript
  /// runner: (state, node, type) => {
  ///   state
  ///     .openNode(type)
  ///     .next(node.children)
  ///     .closeNode();
  /// }
  /// ```
  runner: (state: ParserState, node: MarkdownNode, proseType: NodeType) => void
}

/// The spec for mark parser in schema.
export interface MarkParserSpec {
  /// The match function to check if the node is the target mark.
  /// For example:
  ///
  /// ```typescript
  /// match: (mark) => mark.type === 'emphasis'
  /// ```
  match: (node: MarkdownNode) => boolean
  /// The runner function to transform the node into prosemirror mark.
  /// Generally, you should call methods in `state` to add mark to state.
  /// For example:
  ///
  /// ```typescript
  /// runner: (state, node, type) => {
  ///   state
  ///     .openMark(type)
  ///     .next(node.children)
  ///     .closeMark(type)
  /// }
  /// ```
  runner: (state: ParserState, node: MarkdownNode, proseType: MarkType) => void
}
