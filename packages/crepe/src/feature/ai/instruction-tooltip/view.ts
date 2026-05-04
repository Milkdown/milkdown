import type { Ctx } from '@milkdown/kit/ctx'
import type { EditorState, PluginView } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import { TooltipProvider } from '@milkdown/kit/plugin/tooltip'
import { posToDOMRect } from '@milkdown/kit/prose'
import { TextSelection } from '@milkdown/kit/prose/state'
import { createApp, ref, type App } from 'vue'

import type { ResolvedSuggestions } from './suggestions'

import { runAICmd } from '../commands'
import {
  AIInstructionInput,
  type AIInstructionTooltipChrome,
} from './component'

export interface AIInstructionTooltipViewConfig {
  placeholder: string
  chrome: AIInstructionTooltipChrome
  suggestions: ResolvedSuggestions
}

export class AIInstructionTooltipView implements PluginView {
  #content: HTMLElement
  #provider: TooltipProvider
  #app: App
  #placeholder
  #resetSignal
  #from = -1
  #to = -1
  /// Source of truth for "should the palette currently be showing".
  /// `TooltipProvider.shouldShow` reads this so that forwarding `update()`
  /// to the provider on every editor transition (needed to keep the
  /// floating position in sync with layout changes) doesn't dismiss the
  /// palette behind our back.
  #wantsShow = false

  constructor(
    readonly ctx: Ctx,
    view: EditorView,
    config: AIInstructionTooltipViewConfig
  ) {
    // Wrapped in a ref so the Vue component re-renders if it ever
    // changes; today there's no setter, but keeping it reactive lets a
    // future API (e.g. context-sensitive placeholders) plug in cleanly.
    this.#placeholder = ref(config.placeholder)
    // Bumped on each `show()` so the component clears input/submenu/cursor
    // state — the Vue app stays mounted across hide/show cycles, so its
    // local state would otherwise persist into the next session.
    this.#resetSignal = ref(0)

    const content = document.createElement('div')
    content.className = 'milkdown-ai-instruction'

    const app = createApp(AIInstructionInput, {
      placeholder: this.#placeholder,
      resetSignal: this.#resetSignal,
      suggestions: config.suggestions,
      chrome: config.chrome,
      onConfirm: this.#onConfirm,
      onCancel: this.#onCancel,
    })
    app.mount(content)
    this.#app = app
    this.#content = content

    this.#provider = new TooltipProvider({
      content,
      debounce: 0,
      offset: 10,
      shouldShow: () => this.#wantsShow,
      floatingUIOptions: {
        placement: 'bottom',
      },
    })
    this.#provider.onHide = () => {
      this.#wantsShow = false
      requestAnimationFrame(() => {
        try {
          const v = this.ctx.get(editorViewCtx)
          v.dom.focus({ preventScroll: true })
        } catch {
          // Editor may be destroyed
        }
      })
    }
    this.#provider.update(view)
  }

  #onConfirm = (instruction: string, label?: string) => {
    this.#wantsShow = false
    this.#provider.hide()
    if (instruction.trim()) {
      const commands = this.ctx.get(commandsCtx)
      commands.call(runAICmd.key, { instruction, label })
    }
  }

  #onCancel = () => {
    this.#wantsShow = false
    this.#provider.hide()
  }

  show = (from: number, to: number) => {
    this.#from = from
    this.#to = to
    this.#resetSignal.value++
    this.#wantsShow = true
    const view = this.ctx.get(editorViewCtx)
    this.#provider.show(
      { getBoundingClientRect: () => posToDOMRect(view, from, to) },
      view
    )
    requestAnimationFrame(() => {
      this.#content.querySelector('input')?.focus()
    })
  }

  update = (view: EditorView, prevState?: EditorState) => {
    const { selection } = view.state
    // Hide whenever the anchor selection moves OR becomes a non-text
    // selection (e.g. user clicks an image or table node). Otherwise the
    // tooltip would stay orphaned on screen with no valid range.
    const isTextSelection = selection instanceof TextSelection
    const movedRange =
      selection.from !== this.#from || selection.to !== this.#to
    if (!isTextSelection || movedRange) {
      this.#wantsShow = false
      this.#provider.hide()
      return
    }

    // Forward to the provider so floating UI re-runs its position
    // calculation against the current view (anchor coordinates can shift
    // with layout/document changes even when from/to stay the same).
    this.#provider.update(view, prevState)
  }

  destroy = () => {
    this.#app.unmount()
    this.#provider.destroy()
    this.#content.remove()
  }
}
