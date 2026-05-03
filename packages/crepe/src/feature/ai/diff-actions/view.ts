import type { Ctx } from '@milkdown/kit/ctx'
import type { PluginView } from '@milkdown/kit/prose/state'
import type { EditorView } from '@milkdown/kit/prose/view'

import { commandsCtx, editorViewCtx } from '@milkdown/kit/core'
import {
  acceptAllDiffsCmd,
  clearDiffReviewCmd,
  diffPluginKey,
} from '@milkdown/kit/plugin/diff'
import { TextSelection } from '@milkdown/kit/prose/state'

import { aiSessionCtx, runAICmd } from '../commands'

const PANEL_CLASS = 'milkdown-ai-diff-actions'

/// Fully resolved diff actions config — every field has a value, so the
/// view doesn't have to know about defaults.
export interface ResolvedDiffActionsConfig {
  retryLabel: string
  rejectAllLabel: string
  acceptAllLabel: string
  retryIcon: string
  rejectIcon: string
  acceptIcon: string
  enterKeyIcon: string
  modSymbol: string
}

function createIcon(svg: string): HTMLElement {
  const span = document.createElement('span')
  span.className = `${PANEL_CLASS}-icon`
  span.innerHTML = svg
  return span
}

export class DiffActionsPanelView implements PluginView {
  readonly #panel: HTMLElement
  readonly #host: HTMLElement
  readonly #retryBtn: HTMLButtonElement
  readonly #config: ResolvedDiffActionsConfig
  #visible = false

  constructor(
    readonly ctx: Ctx,
    view: EditorView,
    config: ResolvedDiffActionsConfig
  ) {
    this.#config = config
    this.#host = this.#findHost(view)

    const panel = document.createElement('div')
    panel.className = PANEL_CLASS
    panel.dataset.show = 'false'

    this.#retryBtn = this.#makeButton(
      'retry',
      config.retryIcon,
      config.retryLabel,
      this.#retry
    )
    panel.appendChild(this.#retryBtn)
    panel.appendChild(
      this.#makeButton(
        'reject',
        config.rejectIcon,
        config.rejectAllLabel,
        this.#rejectAll
      )
    )
    const acceptBtn = this.#makeButton(
      'accept',
      config.acceptIcon,
      config.acceptAllLabel,
      this.#acceptAll
    )
    acceptBtn.appendChild(this.#makeShortcutChip())
    panel.appendChild(acceptBtn)

    this.#panel = panel
    this.#host.appendChild(panel)
    this.update(view)
  }

  #findHost(view: EditorView): HTMLElement {
    return (view.dom.closest('.milkdown') as HTMLElement) ?? document.body
  }

  #makeButton(
    variant: 'retry' | 'reject' | 'accept',
    icon: string,
    label: string,
    onClick: () => void
  ): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = `${PANEL_CLASS}-btn ${PANEL_CLASS}-btn-${variant}`
    btn.appendChild(createIcon(icon))
    const text = document.createElement('span')
    text.textContent = label
    btn.appendChild(text)
    btn.addEventListener('mousedown', (e) => e.preventDefault())
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    })
    return btn
  }

  #makeShortcutChip(): HTMLElement {
    const shortcut = document.createElement('span')
    shortcut.className = `${PANEL_CLASS}-shortcut`
    const cmd = document.createElement('span')
    cmd.textContent = this.#config.modSymbol
    const enter = document.createElement('span')
    enter.className = `${PANEL_CLASS}-shortcut-icon`
    enter.innerHTML = this.#config.enterKeyIcon
    shortcut.append(cmd, enter)
    return shortcut
  }

  #retry = (): void => {
    const session = this.ctx.get(aiSessionCtx.key)
    if (!session.lastInstruction) return

    const commands = this.ctx.get(commandsCtx)
    // Clear the diff review first so runAICmd's precondition passes.
    commands.call(clearDiffReviewCmd.key)
    // Restore the original selection so runAICmd operates on the same
    // range. After clearDiffReview the doc is back to its pre-AI state,
    // so the stored from/to are still valid.
    const editorView = this.ctx.get(editorViewCtx)
    const { doc } = editorView.state
    const from = Math.min(Math.max(session.lastFrom, 0), doc.content.size)
    const to = Math.min(Math.max(session.lastTo, 0), doc.content.size)
    editorView.dispatch(
      editorView.state.tr.setSelection(
        TextSelection.create(editorView.state.doc, from, to)
      )
    )
    commands.call(runAICmd.key, {
      instruction: session.lastInstruction,
      label: session.lastLabel,
    })
  }

  #rejectAll = (): void => {
    this.ctx.get(commandsCtx).call(clearDiffReviewCmd.key)
  }

  #acceptAll = (): void => {
    this.ctx.get(commandsCtx).call(acceptAllDiffsCmd.key)
  }

  update(view: EditorView): void {
    const active = !!diffPluginKey.getState(view.state)?.active
    if (active === this.#visible) return
    this.#visible = active
    this.#panel.dataset.show = active ? 'true' : 'false'
    if (active) {
      const session = this.ctx.get(aiSessionCtx.key)
      this.#retryBtn.disabled = !session.lastInstruction
    }
  }

  destroy(): void {
    this.#panel.remove()
  }
}
