import { $ctx } from '@milkdown/utils'

import type { DiffConfig } from './types'

import { withMeta } from './__internal__/with-meta'

/// The configuration context for the diff plugin.
export const diffConfig = $ctx<DiffConfig, 'diffConfig'>(
  { lockOnReview: true, ignoreAttrs: { heading: ['id'] } },
  'diffConfig'
)

withMeta(diffConfig, {
  displayName: 'Ctx<diffConfig>',
  group: 'Diff',
})
