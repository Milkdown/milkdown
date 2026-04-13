import {
  diffComponent,
  diffComponentConfig,
} from '@milkdown/kit/component/diff'
import { diff, diffConfig } from '@milkdown/kit/plugin/diff'
import { streaming, streamingConfig } from '@milkdown/kit/plugin/streaming'

import type { DefineFeature } from '../shared'
import type { AIFeatureConfig } from './types'

import { crepeFeatureConfig } from '../../core/slice'
import { CrepeFeature } from '../index'
import {
  aiProviderConfig,
  aiSessionCtx,
  abortAICmd,
  runAICmd,
} from './commands'

/// Default node types in Crepe that use custom node views.
const CREPE_CUSTOM_BLOCK_TYPES = ['table', 'image-block', 'code_block']

/// Default attrs to ignore in Crepe's diff and streaming features.
const CREPE_IGNORE_ATTRS: Record<string, string[]> = { heading: ['id'] }

export type { AIFeatureConfig, AIPromptContext, AIProvider } from './types'
export { runAICmd, abortAICmd } from './commands'
export { defaultBuildContext } from './context'

export const ai: DefineFeature<AIFeatureConfig> = (editor, config) => {
  const diffCfg = config?.diff ?? {}
  const streamingCfg = config?.streaming ?? {}

  editor
    .config(crepeFeatureConfig(CrepeFeature.AI))
    // -- Diff plugin + component --
    .config((ctx) => {
      ctx.update(diffConfig.key, (prev) => ({
        ...prev,
        ...(diffCfg.lockOnReview !== undefined
          ? { lockOnReview: diffCfg.lockOnReview }
          : {}),
        ignoreAttrs: diffCfg.ignoreAttrs ?? CREPE_IGNORE_ATTRS,
      }))
      const { lockOnReview: _, ignoreAttrs: __, ...componentConfig } = diffCfg
      ctx.update(diffComponentConfig.key, (prev) => ({
        ...prev,
        customBlockTypes:
          componentConfig.customBlockTypes ?? CREPE_CUSTOM_BLOCK_TYPES,
        ...componentConfig,
      }))
    })
    .use(diff)
    .use(diffComponent)
    // -- Streaming plugin --
    .config((ctx) => {
      ctx.update(streamingConfig.key, (prev) => ({
        ...prev,
        ...streamingCfg,
        ignoreAttrs: streamingCfg.ignoreAttrs ?? CREPE_IGNORE_ATTRS,
      }))
    })
    .use(streaming)
    // -- AI orchestration --
    .config((ctx) => {
      ctx.update(aiProviderConfig.key, () => ({
        provider: config?.provider,
        buildContext: config?.buildContext,
        diffReviewOnEnd: config?.diffReviewOnEnd ?? true,
      }))
    })
    .use(aiProviderConfig)
    .use(aiSessionCtx)
    .use(runAICmd)
    .use(abortAICmd)
}
