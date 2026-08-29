import type { Node } from '@milkdown/transformer'

interface Point {
  line: number
  column: number
  offset?: number
}

interface Position {
  start: Point
  end: Point
}

/// Copy a childless leaf node (e.g. an mdast html node). Shallow on
/// purpose — it must never throw, whatever a plugin has attached to
/// `data`. Only `position` is cloned so the copy and the original cannot
/// alias location data, and a `children` property is never carried over.
export function cloneLeaf<T extends Node>(node: T): T {
  const copy = { ...node } as T & { position?: Position; children?: unknown }
  if (copy.position) {
    copy.position = {
      start: { ...copy.position.start },
      end: { ...copy.position.end },
    }
  }
  delete copy.children
  return copy
}
