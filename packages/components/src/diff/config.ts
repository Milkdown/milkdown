import { $ctx } from '@milkdown/utils'

import { withMeta } from '../__internal__/meta'

export interface DiffComponentConfig {
  acceptLabel: string
  rejectLabel: string
  /// Node type names that use custom node views where inline decorations
  /// cannot penetrate. Changes inside these nodes will be merged into
  /// block-level replacements with node-level deletion styling.
  customBlockTypes: string[]
}

const defaultConfig: DiffComponentConfig = {
  acceptLabel: 'Accept',
  rejectLabel: 'Reject',
  customBlockTypes: [],
}

export const diffComponentConfig = $ctx<
  DiffComponentConfig,
  'diffComponentConfig'
>(defaultConfig, 'diffComponentConfig')

withMeta(diffComponentConfig, {
  displayName: 'Ctx<diffComponentConfig>',
  group: 'DiffComponent',
})
