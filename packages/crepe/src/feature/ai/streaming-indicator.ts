import type { Ctx } from '@milkdown/kit/ctx'
import type { Node } from '@milkdown/kit/prose/model'

import { commandsCtx } from '@milkdown/kit/core'
import {
  abortStreamingCmd,
  streamingPluginKey,
} from '@milkdown/kit/plugin/streaming'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { Decoration, DecorationSet } from '@milkdown/kit/prose/view'
import { $prose } from '@milkdown/kit/utils'

import type { AIStreamingIndicatorConfig } from './types'

import { abortAICmd, aiSessionCtx } from './commands'

const CLASS_PREFIX = 'milkdown-ai-streaming'
const SPINNER_PERIOD_MS = 800

export const DEFAULT_STREAMING_FALLBACK_LABEL = 'Generating'
export const DEFAULT_STREAMING_CANCEL_HINT = 'Esc to cancel'

const indicatorKey = new PluginKey<DecorationSet>(
  'CREPE_AI_STREAMING_INDICATOR'
)

/// One spinner per streaming session. The rotation is driven by
/// requestAnimationFrame instead of CSS keyframes so that DOM moves
/// (which happen every chunk as the indicator's position advances) do
/// not reset the animation back to 0deg.
class IndicatorWidget {
  readonly dom: HTMLElement
  readonly #spinner: HTMLElement
  readonly #label: HTMLElement
  readonly #fallbackLabel: string
  readonly #start = performance.now()
  #lastLabelText = ''
  #rafId = 0

  constructor(ctx: Ctx, fallbackLabel: string, cancelHint: string) {
    this.#fallbackLabel = fallbackLabel

    const dom = document.createElement('span')
    dom.className = `${CLASS_PREFIX}-indicator`
    dom.contentEditable = 'false'

    const spinner = document.createElement('span')
    spinner.className = `${CLASS_PREFIX}-spinner`
    dom.appendChild(spinner)

    const label = document.createElement('span')
    label.className = `${CLASS_PREFIX}-label`
    dom.appendChild(label)

    const escHint = document.createElement('span')
    escHint.className = `${CLASS_PREFIX}-esc`
    escHint.textContent = cancelHint
    dom.appendChild(escHint)

    this.dom = dom
    this.#spinner = spinner
    this.#label = label
    this.setLabel(ctx)
    this.#tick()
  }

  setLabel(ctx: Ctx) {
    const session = ctx.get(aiSessionCtx.key)
    const text = `${session.label || this.#fallbackLabel}…`
    if (text === this.#lastLabelText) return
    this.#lastLabelText = text
    this.#label.textContent = text
  }

  destroy() {
    if (this.#rafId) cancelAnimationFrame(this.#rafId)
    this.#rafId = 0
  }

  #tick = () => {
    const elapsed = performance.now() - this.#start
    const angle = (elapsed / SPINNER_PERIOD_MS) * 360
    this.#spinner.style.transform = `rotate(${angle}deg)`
    this.#rafId = requestAnimationFrame(this.#tick)
  }
}

interface StreamingIndicatorPluginOptions {
  config?: AIStreamingIndicatorConfig
}

export function streamingIndicatorPlugin(
  options: StreamingIndicatorPluginOptions = {}
) {
  const { config } = options
  const fallbackLabel =
    config?.fallbackLabel ?? DEFAULT_STREAMING_FALLBACK_LABEL
  const cancelHint = config?.cancelHint ?? DEFAULT_STREAMING_CANCEL_HINT

  return $prose((ctx) => {
    let widget: IndicatorWidget | null = null

    function ensureWidget(): IndicatorWidget {
      if (!widget) widget = new IndicatorWidget(ctx, fallbackLabel, cancelHint)
      else widget.setLabel(ctx)
      return widget
    }

    function dropWidget(): void {
      if (widget) {
        widget.destroy()
        widget = null
      }
    }

    function buildSet(doc: Node, insertEndPos: number): DecorationSet {
      const pos = Math.min(insertEndPos, doc.content.size)
      const decoration = Decoration.widget(pos, ensureWidget().dom, {
        side: 1,
        key: 'ai-streaming-indicator',
      })
      return DecorationSet.create(doc, [decoration])
    }

    return new Plugin<DecorationSet>({
      key: indicatorKey,
      state: {
        init: () => DecorationSet.empty,
        apply(tr, decorations, _oldState, newState) {
          const streaming = streamingPluginKey.getState(newState)
          if (!streaming?.active || streaming.insertEndPos == null) {
            dropWidget()
            return DecorationSet.empty
          }
          if (tr.getMeta(streamingPluginKey) || tr.docChanged) {
            return buildSet(newState.doc, streaming.insertEndPos)
          }
          return decorations.map(tr.mapping, tr.doc)
        },
      },
      view() {
        return {
          destroy() {
            dropWidget()
          },
        }
      },
      props: {
        decorations(state) {
          return indicatorKey.getState(state) ?? DecorationSet.empty
        },
        handleKeyDown(view, event) {
          if (event.key !== 'Escape') return false
          const commands = ctx.get(commandsCtx)
          // AI-driven session: route through abortAICmd so the AI
          // session state (abortController, label) cleans up too.
          if (ctx.get(aiSessionCtx.key).abortController) {
            event.preventDefault()
            commands.call(abortAICmd.key, { keep: true })
            return true
          }
          // Manual streaming session (no AI session in flight) — abort
          // the streaming plugin directly so the "Esc to cancel" hint
          // shown in the pill isn't misleading.
          if (streamingPluginKey.getState(view.state)?.active) {
            event.preventDefault()
            commands.call(abortStreamingCmd.key, { keep: true })
            return true
          }
          return false
        },
      },
    })
  })
}
