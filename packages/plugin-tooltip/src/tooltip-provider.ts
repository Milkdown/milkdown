/* Copyright 2021, Milkdown by Mirone. */
import { posToDOMRect } from '@milkdown/prose'
import type { EditorState } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'

/// Options for tooltip provider.
export type TooltipProviderOptions = {
  /// The tooltip content.
  content: HTMLElement
  /// The options for creating [tippy.js](https://atomiks.github.io/tippyjs/) instance.
  tippyOptions?: Partial<Props>
  /// The debounce time for updating tooltip, 200ms by default.
  debounce?: number
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

/// A provider for creating tooltip.
export class TooltipProvider {
  /// @internal
  #tippy: Instance | undefined

  /// @internal
  #tippyOptions: Partial<Props>

  /// @internal
  #debounce: number

  /// @internal
  #shouldShow: (view: EditorView, prevState?: EditorState) => boolean

  /// The root element of the tooltip.
  element: HTMLElement

  constructor(options: TooltipProviderOptions) {
    this.element = options.content
    this.#tippyOptions = options.tippyOptions ?? {}
    this.#debounce = options.debounce ?? 200
    this.#shouldShow = options.shouldShow ?? this.#_shouldShow
  }

  /// @internal
  #onUpdate = (view: EditorView, prevState?: EditorState): void => {
    const { state, composing } = view
    const { selection, doc } = state
    const { ranges } = selection
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))
    const isSame = prevState && prevState.doc.eq(doc) && prevState.selection.eq(selection)

    this.#tippy ??= tippy(view.dom, {
      trigger: 'manual',
      interactive: true,
      ...this.#tippyOptions,
      content: this.element,
    })

    if (composing || isSame)
      return

    if (!this.#shouldShow(view, prevState)) {
      this.hide()
      return
    }

    this.#tippy.setProps({
      getReferenceClientRect: () => posToDOMRect(view, from, to),
    })

    this.show()
  }

  /// Update provider state by editor view.
  update = (view: EditorView, prevState?: EditorState): void => {
    const updater = debounce(this.#onUpdate, this.#debounce)

    updater(view, prevState)
  }

  /// @internal
  #_shouldShow(view: EditorView): boolean {
    const { doc, selection } = view.state
    const { empty, from, to } = selection

    const isEmptyTextBlock = !doc.textBetween(from, to).length && view.state.selection instanceof TextSelection

    const isTooltipChildren = this.element.contains(document.activeElement)

    const notHasFocus = !view.hasFocus() && !isTooltipChildren

    const isReadonly = !view.editable

    if (
      notHasFocus
      || empty
      || isEmptyTextBlock
      || isReadonly
    )
      return false

    return true
  }

  /// Destroy the tooltip.
  destroy = () => {
    this.#tippy?.destroy()
  }

  /// Show the tooltip.
  show = () => {
    this.#tippy?.show()
  }

  /// Hide the tooltip.
  hide = () => {
    this.#tippy?.hide()
  }

  /// Get the [tippy.js](https://atomiks.github.io/tippyjs/) instance.
  getInstance = () => {
    return this.#tippy
  }
}
