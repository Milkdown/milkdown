import { $ctx } from '@milkdown/utils'

import type { DiffConfig } from './types'

import { withMeta } from './__internal__/with-meta'

export const diffConfig = $ctx<DiffConfig, 'diffConfig'>(
  { lockOnReview: true },
  'diffConfig'
)

withMeta(diffConfig, {
  displayName: 'Ctx<diffConfig>',
  group: 'Diff',
})
