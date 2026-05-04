import type { Ctx } from '@milkdown/kit/ctx'
import type { Node } from '@milkdown/kit/prose/model'
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
  /// Doc snapshot at the moment diff review activated. If the live doc
  /// drifts from this snapshot the user has accepted some per-change
  /// diffs and the stored `lastFrom`/`lastTo` no longer point at the
  /// original range — Retry is unsafe at that point.
  #diffStartDoc: Node | null = null
  /// Whether the active diff review came from this AI session's
  /// streaming hand-off (vs being started manually via
  /// `startDiffReviewCmd`). Captured at the false→true transition.
  #ownedByAI = false

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
    // Refuse to retry when the active diff didn't originate from this
    // AI session, or once the user has accepted any individual diff —
    // `clearDiffReviewCmd` only exits diff mode, it doesn't roll back
    // accepted changes, so the stored range would point at shifted text.
    if (!this.#ownedByAI || !this.#canRetry()) return

    const commands = this.ctx.get(commandsCtx)
    commands.call(clearDiffReviewCmd.key)
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

  #canRetry(): boolean {
    if (!this.#diffStartDoc) return false
    const editorView = this.ctx.get(editorViewCtx)
    return editorView.state.doc.eq(this.#diffStartDoc)
  }

  #rejectAll = (): void => {
    this.ctx.get(commandsCtx).call(clearDiffReviewCmd.key)
  }

  #acceptAll = (): void => {
    this.ctx.get(commandsCtx).call(acceptAllDiffsCmd.key)
  }

  update(view: EditorView): void {
    const active = !!diffPluginKey.getState(view.state)?.active

    if (active !== this.#visible) {
      this.#visible = active
      this.#panel.dataset.show = active ? 'true' : 'false'
      if (active) {
        // false → true. Capture ownership now; from this point on any
        // doc drift means the user has accepted individual diffs.
        const session = this.ctx.get(aiSessionCtx.key)
        this.#ownedByAI = session.diffOwnedByAI
        this.#diffStartDoc = view.state.doc
      } else {
        // true → false. Clear local state and the session-level flag so
        // a subsequent manual diff doesn't pick up stale ownership.
        this.#ownedByAI = false
        this.#diffStartDoc = null
        const session = this.ctx.get(aiSessionCtx.key)
        if (session.diffOwnedByAI) {
          this.ctx.set(aiSessionCtx.key, {
            ...session,
            diffOwnedByAI: false,
          })
        }
      }
    }

    if (active) {
      // Re-evaluate Retry every transaction so the button disables the
      // moment a per-change accept shifts the doc out of its initial
      // form, and stays disabled for diff reviews this AI session
      // didn't start.
      const session = this.ctx.get(aiSessionCtx.key)
      const docUntouched =
        !!this.#diffStartDoc && view.state.doc.eq(this.#diffStartDoc)
      this.#retryBtn.disabled =
        !this.#ownedByAI || !session.lastInstruction || !docUntouched
    }
  }

  destroy(): void {
    this.#panel.remove()
  }
}
