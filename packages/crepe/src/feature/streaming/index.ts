import type { StreamingConfig } from '@milkdown/kit/plugin/streaming'

import { streaming, streamingConfig } from '@milkdown/kit/plugin/streaming'

import type { DefineFeature } from '../shared'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'

export type StreamingFeatureConfig = Partial<StreamingConfig>

export const streamingFeature: DefineFeature<StreamingFeatureConfig> = (
  editor,
  config
) => {
  editor
    .config(crepeFeatureConfig(CrepeFeature.Streaming))
    .config((ctx) => {
      if (config) {
        ctx.update(streamingConfig.key, (prev) => ({
          ...prev,
          ...config,
        }))
      }
    })
    .use(streaming)
}
