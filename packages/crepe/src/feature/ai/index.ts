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
import { diffActionsPanelPlugin } from './diff-actions'
import {
  aiInstructionTooltip,
  aiInstructionTooltipAPI,
  configureAIInstructionTooltip,
} from './instruction-tooltip'
import { streamingIndicatorPlugin } from './streaming-indicator'

/// Default node types in Crepe that use custom node views.
const CREPE_CUSTOM_BLOCK_TYPES = ['table', 'image-block', 'code_block']

/// Default attrs to ignore in Crepe's diff and streaming features.
const CREPE_IGNORE_ATTRS: Record<string, string[]> = { heading: ['id'] }

export type {
  AIDiffActionsConfig,
  AIFeatureConfig,
  AIPromptContext,
  AIProvider,
  AIStreamingIndicatorConfig,
  AISubmenuBuilder,
  AISubmenuDef,
  AISuggestionItem,
  AISuggestionsBuilder,
} from './types'
export type { AIProviderConfigValue } from './commands'
export { runAICmd, abortAICmd, useAIProviderConfig } from './commands'
export { defaultBuildContext } from './context'
export type { AIInstructionTooltipAPI } from './instruction-tooltip'
export { useAIInstructionTooltipAPI } from './instruction-tooltip'
// The SVG Crepe's own AI button falls back to, so a replacement toolbar can
// match it. `AIFeatureConfig.aiIcon` overrides it for the built-in button.
export { aiIcon as defaultAIIcon } from '../../icons'

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
        // `diffReviewOnEnd` reaches the streaming plugin, so an
        // `endStreamingCmd` call outside `runAICmd` respects it too. An
        // override happens only on an explicit user value. Otherwise the
        // streaming plugin keeps its own default, which a test and a
        // manual streaming session both rely on.
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
        ...(config?.aiIcon !== undefined ? { aiIcon: config.aiIcon } : {}),
      }))
    })
    .use(aiProviderConfig)
    .use(aiSessionCtx)
    .use(runAICmd)
    .use(abortAICmd)
    .config(configureAIInstructionTooltip(config))
    .use(aiInstructionTooltipAPI)
    .use(aiInstructionTooltip)
    .use(streamingIndicatorPlugin({ config: config?.streamingIndicator }))
    // -- Diff actions panel --
    .use(
      diffActionsPanelPlugin({
        config: config?.diffActions,
        enterKeyIcon: config?.enterKeyIcon,
      })
    )
}
