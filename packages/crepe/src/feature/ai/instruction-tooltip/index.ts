import type { Ctx } from '@milkdown/kit/ctx'

import { tooltipFactory } from '@milkdown/kit/plugin/tooltip'
import { $ctx } from '@milkdown/kit/utils'

import type { AIFeatureConfig } from '../types'
import type { AIInstructionTooltipChrome } from './component'

import {
  aiIcon as defaultAiIcon,
  chevronLeftIcon as defaultChevronLeftIcon,
  chevronRightIcon as defaultChevronRightIcon,
  enterKeyIcon as defaultEnterKeyIcon,
  sendIcon as defaultSendIcon,
  sendPromptIcon as defaultSendPromptIcon,
} from '../../../icons'
import { AISuggestionsBuilder, applyDefaultSuggestions } from './suggestions'
import {
  AIInstructionTooltipView,
  type AIInstructionTooltipViewConfig,
} from './view'

export interface AIInstructionTooltipAPI {
  show: (from: number, to: number) => void
}

const defaultAPI: AIInstructionTooltipAPI = {
  show: () => {},
}

export const aiInstructionTooltipAPI = $ctx(
  { ...defaultAPI },
  'aiInstructionTooltipAPI'
)

export const aiInstructionTooltip = tooltipFactory('CREPE_AI_INSTRUCTION')

/// Default strings for the instruction tooltip. Exported so the JSDoc on
/// `AIFeatureConfig` and consumers stay in sync with what the resolver
/// actually uses.
export const DEFAULT_SUGGESTIONS_HEADER_LABEL = 'SUGGESTIONS'
export const DEFAULT_SEND_AS_PROMPT_HEADER_LABEL = 'SEND AS PROMPT'
export const DEFAULT_SEND_AS_PROMPT_LABEL = 'Ask AI:'
export const DEFAULT_SUBMIT_BUTTON_LABEL = 'Send prompt'
export const DEFAULT_INSTRUCTION_PLACEHOLDER =
  'Tell AI what to do with the selection…'

function resolveChrome(config?: AIFeatureConfig): AIInstructionTooltipChrome {
  return {
    aiIcon: config?.aiIcon ?? defaultAiIcon,
    sendIcon: config?.sendIcon ?? defaultSendIcon,
    sendPromptIcon: config?.sendPromptIcon ?? defaultSendPromptIcon,
    enterKeyIcon: config?.enterKeyIcon ?? defaultEnterKeyIcon,
    chevronLeftIcon: config?.chevronLeftIcon ?? defaultChevronLeftIcon,
    chevronRightIcon: config?.chevronRightIcon ?? defaultChevronRightIcon,
    suggestionsHeaderLabel:
      config?.suggestionsHeaderLabel ?? DEFAULT_SUGGESTIONS_HEADER_LABEL,
    sendAsPromptHeaderLabel:
      config?.sendAsPromptHeaderLabel ?? DEFAULT_SEND_AS_PROMPT_HEADER_LABEL,
    sendAsPromptLabel:
      config?.sendAsPromptLabel ?? DEFAULT_SEND_AS_PROMPT_LABEL,
    submitButtonLabel: config?.submitButtonLabel ?? DEFAULT_SUBMIT_BUTTON_LABEL,
  }
}

function resolveViewConfig(
  config?: AIFeatureConfig
): AIInstructionTooltipViewConfig {
  const builder = new AISuggestionsBuilder()
  applyDefaultSuggestions(builder)
  config?.buildAISuggestions?.(builder)
  return {
    placeholder:
      config?.instructionPlaceholder ?? DEFAULT_INSTRUCTION_PLACEHOLDER,
    chrome: resolveChrome(config),
    suggestions: builder.build(),
  }
}

export function configureAIInstructionTooltip(config?: AIFeatureConfig) {
  return (ctx: Ctx) => {
    const viewConfig = resolveViewConfig(config)
    let tooltipView: AIInstructionTooltipView | null = null

    ctx.update(aiInstructionTooltipAPI.key, (api) => ({
      ...api,
      show: (from, to) => {
        tooltipView?.show(from, to)
      },
    }))

    ctx.set(aiInstructionTooltip.key, {
      view: (view) => {
        tooltipView = new AIInstructionTooltipView(ctx, view, viewConfig)
        return tooltipView
      },
    })
  }
}
