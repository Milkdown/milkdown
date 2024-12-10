import type { MarkSpec, NodeSpec } from '@milkdown/prose/model'
import type { remark } from 'remark'
import type { Plugin, Transformer } from 'unified'
import type { MarkParserSpec, NodeParserSpec } from '../parser/types'
import type {
  MarkSerializerSpec,
  NodeSerializerSpec,
} from '../serializer/types'

/// @internal
export type Node = Parameters<Transformer>[0]

/// @internal
export type Root = Parameters<(typeof remark)['stringify']>[0]

/// @internal
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }

/// @internal
export type JSONRecord = Record<string, JSONValue>

/// @internal
export type RemarkPluginRaw<T> = Plugin<[T], Root>

/// The universal type of a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md).
export interface RemarkPlugin<T = Record<string, unknown>> {
  plugin: Plugin<[T], Root>
  options: T
}

/// The type of [remark instance](https://github.com/remarkjs/remark/tree/main/packages/remark#remark-1).
export type RemarkParser = ReturnType<typeof remark>

/// The universal type of a node in [mdast](https://github.com/syntax-tree/mdast).
export type MarkdownNode = Node & {
  children?: MarkdownNode[]
  [x: string]: unknown
}

/// Schema spec for node. It is a super set of [NodeSpec](https://prosemirror.net/docs/ref/#model.NodeSpec).
export interface NodeSchema extends NodeSpec {
  /// To markdown serializer spec.
  readonly toMarkdown: NodeSerializerSpec
  /// Parse markdown serializer spec.
  readonly parseMarkdown: NodeParserSpec
  /// The priority of the node, by default it's 50.
  readonly priority?: number
}

/// Schema spec for mark. It is a super set of [MarkSpec](https://prosemirror.net/docs/ref/#model.MarkSpec).
export interface MarkSchema extends MarkSpec {
  /// To markdown serializer spec.
  readonly toMarkdown: MarkSerializerSpec
  /// Parse markdown serializer spec.
  readonly parseMarkdown: MarkParserSpec
}
