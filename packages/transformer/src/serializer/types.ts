import type { Mark, Node } from '@milkdown/prose/model'

import type { SerializerState } from './state'

/// The serializer type which is used to transform prosemirror node into markdown text.
export type Serializer = (content: Node) => string

/// The spec for node serializer in schema.
export interface NodeSerializerSpec {
  /// The match function to check if the node is the target node.
  /// For example:
  ///
  /// ```typescript
  /// match: (node) => node.type.name === 'paragraph'
  /// ```
  match: (node: Node) => boolean
  /// The runner function to transform the node into markdown text.
  /// Generally, you should call methods in `state` to add node to state.
  /// For example:
  ///
  /// ```typescript
  /// runner: (state, node) => {
  ///   state
  ///     .openNode(node.type.name)
  ///     .next(node.content)
  ///     .closeNode();
  /// }
  /// ```
  runner: (state: SerializerState, node: Node) => void
}

/// The spec for mark serializer in schema.
export interface MarkSerializerSpec {
  /// The match function to check if the node is the target mark.
  /// For example:
  ///
  /// ```typescript
  /// match: (mark) => mark.type.name === 'emphasis'
  /// ```
  match: (mark: Mark) => boolean
  /// The runner function to transform the node into markdown text.
  /// Generally, you should call methods in `state` to add mark to state.
  /// For example:
  ///
  /// ```typescript
  /// runner: (state, mark, node) => {
  ///   state.withMark(mark, 'emphasis');
  /// }
  /// ```
  runner: (state: SerializerState, mark: Mark, node: Node) => void | boolean
}
