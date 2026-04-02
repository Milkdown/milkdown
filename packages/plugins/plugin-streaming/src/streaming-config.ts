import { $ctx } from '@milkdown/utils'

import type { StreamingConfig } from './types'

import { withMeta } from './__internal__/with-meta'

/// The configuration context for the streaming plugin.
export const streamingConfig = $ctx<StreamingConfig, 'streamingConfig'>(
  {
    throttleMs: 100,
    lockDuringStreaming: true,
    scrollFollow: true,
    diffReviewOnEnd: false,
  },
  'streamingConfig'
)

withMeta(streamingConfig, {
  displayName: 'Ctx<streamingConfig>',
  group: 'Streaming',
})
