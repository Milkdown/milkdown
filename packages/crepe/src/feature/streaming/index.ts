import type { StreamingConfig } from '@milkdown/kit/plugin/streaming'

import { streaming, streamingConfig } from '@milkdown/kit/plugin/streaming'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'

/// Default attrs to ignore during streaming flush in Crepe.
const CREPE_IGNORE_ATTRS: Record<string, string[]> = { heading: ['id'] }

export type StreamingFeatureConfig = Partial<StreamingConfig>

export const streamingFeature: DefineFeature<StreamingFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Streaming))
    .config((ctx) => {
      ctx.update(streamingConfig.key, (prev) => ({
        ...prev,
        ...config,
        ignoreAttrs: config?.ignoreAttrs ?? CREPE_IGNORE_ATTRS,
      }))
    })
    .use(streaming)
}
