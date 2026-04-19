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
        ignoreAttrs: diffCfg.ignoreAttrs ?? CREPE_IGNORE_ATTRS,
      }))
      const { ignoreAttrs: _, ...componentConfig } = diffCfg
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
        // Wire diffReviewOnEnd into the streaming plugin so manual
        // endStreamingCmd calls (outside runAICmd) also respect it.
        // Only override if the user explicitly set it — otherwise
        // keep the streaming plugin's own default so tests and
        // manual-streaming use cases aren't surprised.
        ...(config?.diffReviewOnEnd !== undefined
          ? { diffReviewOnEnd: config.diffReviewOnEnd }
          : {}),
      }))
    })
    .use(streaming)
    // -- AI orchestration --
    .config((ctx) => {
      ctx.update(aiProviderConfig.key, (prev) => ({
        ...prev,
        ...(config?.provider !== undefined
          ? { provider: config.provider }
          : {}),
        ...(config?.buildContext !== undefined
          ? { buildContext: config.buildContext }
          : {}),
        diffReviewOnEnd: config?.diffReviewOnEnd ?? prev.diffReviewOnEnd,
        ...(config?.onError !== undefined ? { onError: config.onError } : {}),
      }))
    })
    .use(aiProviderConfig)
    .use(aiSessionCtx)
    .use(runAICmd)
    .use(abortAICmd)
}
