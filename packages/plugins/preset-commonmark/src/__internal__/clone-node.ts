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

/// Copy a childless leaf node (e.g. an mdast html node) without sharing
/// any nested objects with the original: `position` and `data` are cloned
/// and a `children` property is never carried over.
export function cloneLeaf<T extends Node>(node: T): T {
  const copy = { ...node } as T & {
    position?: Position
    data?: unknown
    children?: unknown
  }
  if (copy.position) {
    copy.position = {
      start: { ...copy.position.start },
      end: { ...copy.position.end },
    }
  }
  if (copy.data !== undefined) copy.data = JSON.parse(JSON.stringify(copy.data))
  delete copy.children
  return copy
}
