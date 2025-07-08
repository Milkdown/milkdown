import type { ResolvedPos } from '@milkdown/prose/model'

import { findParentNodeClosestToPos } from '@milkdown/prose'

/// Find the table node with position information for target pos.
export function findTable($pos: ResolvedPos) {
  return findParentNodeClosestToPos(
    (node) => node.type.spec.tableRole === 'table'
  )($pos)
}
