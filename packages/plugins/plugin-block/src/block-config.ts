import type { Node } from '@milkdown/prose/model'
import { $ctx } from '@milkdown/utils'

import { withMeta } from './__internal__/with-meta'

/// @internal
export type FilterNodes = (node: Node) => boolean

/// @internal
export const defaultNodeFilter: FilterNodes = (node) => {
  const { name } = node.type
  if (name.startsWith('table') && name !== 'table')
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
