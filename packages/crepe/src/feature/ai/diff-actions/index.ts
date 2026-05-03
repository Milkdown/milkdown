import { commandsCtx } from '@milkdown/kit/core'
import {
  acceptAllDiffsCmd,
  diffPluginKey,
} from '@milkdown/kit/plugin/diff'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

import {
  clearIcon as defaultRejectIcon,
  confirmIcon as defaultAcceptIcon,
  enterKeyIcon as defaultEnterKeyIcon,
  retryIcon as defaultRetryIcon,
} from '../../../icons'
import type { AIDiffActionsConfig } from '../types'
import { DiffActionsPanelView, type ResolvedDiffActionsConfig } from './view'

const diffActionsPanelKey = new PluginKey('CREPE_AI_DIFF_ACTIONS_PANEL')

export const DEFAULT_DIFF_ACTIONS_RETRY_LABEL = 'Retry'
export const DEFAULT_DIFF_ACTIONS_REJECT_ALL_LABEL = 'Reject all'
export const DEFAULT_DIFF_ACTIONS_ACCEPT_ALL_LABEL = 'Accept all'
export const DEFAULT_DIFF_ACTIONS_MOD_SYMBOL = '⌘'

interface DiffActionsPluginOptions {
  config?: AIDiffActionsConfig
  /// The enter-key icon is owned by the top-level `AIFeatureConfig` so a
  /// single override applies to both the instruction tooltip and this
  /// panel's shortcut chip.
  enterKeyIcon?: string
}

function resolveDiffActionsConfig(
  options: DiffActionsPluginOptions
): ResolvedDiffActionsConfig {
  const { config, enterKeyIcon } = options
  return {
    retryLabel: config?.retryLabel ?? DEFAULT_DIFF_ACTIONS_RETRY_LABEL,
    rejectAllLabel:
      config?.rejectAllLabel ?? DEFAULT_DIFF_ACTIONS_REJECT_ALL_LABEL,
    acceptAllLabel:
      config?.acceptAllLabel ?? DEFAULT_DIFF_ACTIONS_ACCEPT_ALL_LABEL,
    retryIcon: config?.retryIcon ?? defaultRetryIcon,
    rejectIcon: config?.rejectIcon ?? defaultRejectIcon,
    acceptIcon: config?.acceptIcon ?? defaultAcceptIcon,
    enterKeyIcon: enterKeyIcon ?? defaultEnterKeyIcon,
    modSymbol: config?.modSymbol ?? DEFAULT_DIFF_ACTIONS_MOD_SYMBOL,
  }
}

export function diffActionsPanelPlugin(options: DiffActionsPluginOptions = {}) {
  const resolved = resolveDiffActionsConfig(options)

  return $prose((ctx) => {
    return new Plugin({
      key: diffActionsPanelKey,
      view(view) {
        return new DiffActionsPanelView(ctx, view, resolved)
      },
      props: {
        handleKeyDown(view, event) {
          if (event.key !== 'Enter') return false
          if (!(event.metaKey || event.ctrlKey)) return false
          if (!diffPluginKey.getState(view.state)?.active) return false
          event.preventDefault()
          const commands = ctx.get(commandsCtx)
          commands.call(acceptAllDiffsCmd.key)
          return true
        },
      },
    })
  })
}
