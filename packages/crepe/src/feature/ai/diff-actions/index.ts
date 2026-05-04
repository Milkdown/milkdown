import { commandsCtx } from '@milkdown/kit/core'
import { acceptAllDiffsCmd, diffPluginKey } from '@milkdown/kit/plugin/diff'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { $prose } from '@milkdown/kit/utils'

import type { AIDiffActionsConfig } from '../types'

import {
  clearIcon as defaultRejectIcon,
  confirmIcon as defaultAcceptIcon,
  enterKeyIcon as defaultEnterKeyIcon,
  retryIcon as defaultRetryIcon,
} from '../../../icons'
import { aiSessionCtx } from '../commands'
import { DiffActionsPanelView, type ResolvedDiffActionsConfig } from './view'

const diffActionsPanelKey = new PluginKey('CREPE_AI_DIFF_ACTIONS_PANEL')

export const DEFAULT_DIFF_ACTIONS_RETRY_LABEL = 'Retry'
export const DEFAULT_DIFF_ACTIONS_REJECT_ALL_LABEL = 'Reject all'
export const DEFAULT_DIFF_ACTIONS_ACCEPT_ALL_LABEL = 'Accept all'

function detectModSymbol(): string {
  if (typeof navigator === 'undefined') return '⌘'
  // `userAgentData.platform` is the modern accessor; fall back to the
  // legacy `platform` / `userAgent` strings for older browsers and
  // jsdom-based test environments.
  const ua = navigator as unknown as {
    userAgentData?: { platform?: string }
    platform?: string
    userAgent?: string
  }
  const platform =
    ua.userAgentData?.platform ?? ua.platform ?? ua.userAgent ?? ''
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘' : 'Ctrl'
}

/// Detected per renderer process. Override via
/// `AIDiffActionsConfig.modSymbol` when the UI should diverge from the
/// runtime platform (e.g. always render `⌘` in a macOS-themed product).
export const DEFAULT_DIFF_ACTIONS_MOD_SYMBOL = detectModSymbol()

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
          // Only intercept Mod-Enter for diffs this AI session started.
          // Manual `startDiffReviewCmd` flows shouldn't have their key
          // bindings mutated just because the AI feature is loaded.
          if (!ctx.get(aiSessionCtx.key).diffOwnedByAI) return false
          event.preventDefault()
          const commands = ctx.get(commandsCtx)
          commands.call(acceptAllDiffsCmd.key)
          return true
        },
      },
    })
  })
}
