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

/// Shallow-copy a node, cloning its `position` so the copy and the
/// original cannot alias location data.
export function cloneNodeWithPosition<T extends Node>(node: T): T {
  const position = (node as T & { position?: Position }).position
  if (!position) return { ...node }
  return {
    ...node,
    position: {
      start: { ...position.start },
      end: { ...position.end },
    },
  }
}
