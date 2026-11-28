import type { Node } from '@milkdown/prose/model'
import type { Handle, State } from 'mdast-util-to-markdown'

import { phrasing } from 'mdast-util-phrasing'
import { defaultHandlers } from 'mdast-util-to-markdown'

import type { Root } from '../utility'

/// What the serializer wrote for a document, split by its top-level nodes.
export interface SerializedSegments {
  /// The whole markdown text, the same text that the serializer gives.
  full: string
  /// The text of each top-level node as it is in `full`.
  texts: string[]
  /// The text of each top-level node when it is the only node of a
  /// document. The serializer can write a node in another way after some
  /// other node, so the entry in `texts` depends on what comes before the
  /// node, and this one does not.
  keys: string[]
  /// The text between each top-level node and the next one. It has one
  /// entry less than `texts`.
  separators: string[]
  /// The node of the document that each text was written for. A node that
  /// wrote nothing has no entry, for example the empty paragraph at the
  /// end of a document. It is `null` when the texts cannot be told apart
  /// by node, because a node wrote more than one of them.
  nodes: readonly Node[] | null
}

/// What the root handler saw of one child of the root.
interface Written {
  text: string
  /// Where the text starts in the whole text, as the serializer counts it.
  line: number
  column: number
}

type FlowNode = Parameters<State['handle']>[0]

const sinks = new WeakMap<object, Written[]>()

/// @internal
/// A handler for the root node of a markdown tree. The default handler
/// still writes the root. When `collectSegments` asks for it, this one
/// looks at each child of the root while it is written.
export const segmentRootHandler: Handle = (node, parent, state, info) => {
  const sink = sinks.get(node)
  const children: FlowNode[] = node.children ?? []
  if (!sink || children.some((child) => phrasing(child)))
    return defaultHandlers.root(node, parent, state, info)

  const handle = state.handle
  const watch: Handle = (child, childParent, childState, childInfo) => {
    const text = handle(child, childParent, childState, childInfo)
    if (childParent === node) {
      const { line, column } = childInfo.now
      sink.push({ text, line, column })
    }
    return text
  }
  // The serializer also reads the handlers of each node type from
  // `state.handle`, so the replacement has to carry them.
  state.handle = Object.assign(watch, handle)
  try {
    return defaultHandlers.root(node, parent, state, info)
  } finally {
    state.handle = handle
  }
}

/// @internal
/// Serialize `root` with `stringify` and collect the text of each child.
/// It gives `null` when the root handler is not `segmentRootHandler`, or
/// when the texts are not where the serializer said they are.
export function collectSegments(
  root: Root,
  stringify: (root: Root) => string
): Pick<SerializedSegments, 'full' | 'texts' | 'separators'> | null {
  const written: Written[] = []
  sinks.set(root, written)
  let full: string
  try {
    full = stringify(root)
  } finally {
    sinks.delete(root)
  }
  if (written.length !== root.children.length) return null

  // The serializer counts lines the way `String.split` does with this
  // pattern, and columns from 1.
  const lines = [0]
  for (const match of full.matchAll(/\r?\n|\r/g))
    lines.push(match.index + match[0].length)

  const separators: string[] = []
  let end = 0
  for (const [index, { text, line, column }] of written.entries()) {
    const lineStart = lines[line - 1]
    if (lineStart == null) return null

    const start = lineStart + column - 1
    if (start < end || !full.startsWith(text, start)) return null
    if (index > 0) separators.push(full.slice(end, start))
    else if (start !== 0) return null
    end = start + text.length
  }
  // The serializer ends a text that is not empty with a line ending.
  const rest = full.slice(end)
  if (rest !== '' && rest !== '\n') return null

  return { full, texts: written.map(({ text }) => text), separators }
}
