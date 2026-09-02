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

/// Copy a childless leaf node, for example an mdast html node. The copy
/// stays shallow on purpose, so it never throws over whatever a plugin
/// attached to `data`. Only `position` is cloned, so the copy and the
/// original share no location data. A `children` property never carries
/// over.
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
