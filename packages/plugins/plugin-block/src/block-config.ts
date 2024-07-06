import type { Node, ResolvedPos } from '@milkdown/prose/model'
import { $ctx } from '@milkdown/utils'

import { findParent } from '@milkdown/prose'
import { withMeta } from './__internal__/with-meta'

/// @internal
export type FilterNodes = (pos: ResolvedPos, node: Node) => boolean

/// @internal
export const defaultNodeFilter: FilterNodes = (pos) => {
  const table = findParent(node => node.type.name === 'table')(pos)
  if (table)
    return false

  return true
}

/// A slice contains the block config.
/// Possible properties:
/// - `filterNodes`: A function to filter nodes that can be dragged.
export const blockConfig = $ctx<{ filterNodes: FilterNodes }, 'blockConfig'>({ filterNodes: defaultNodeFilter }, 'blockConfig')

withMeta(blockConfig, {
  displayName: 'Ctx<blockConfig>',
})
