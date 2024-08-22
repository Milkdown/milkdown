import type { EditorState } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'
import type { VirtualElement } from '@floating-ui/dom'
import { computePosition, flip, offset } from '@floating-ui/dom'
import { posToDOMRect } from '@milkdown/prose'

/// Options for tooltip provider.
export interface TooltipProviderOptions {
  /// The tooltip content.
  content: HTMLElement
  /// The debounce time for updating tooltip, 200ms by default.
  debounce?: number
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
  /// The offset to get the block. Default is 0.
  offset?: number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }
}

/// A provider for creating tooltip.
export class TooltipProvider {
  /// @internal
  readonly #debounce: number

  /// @internal
  readonly #shouldShow: (view: EditorView, prevState?: EditorState) => boolean

  /// @internal
  #initialized = false

  /// @internal
  readonly #offset?: number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }

  /// The root element of the tooltip.
  element: HTMLElement

  /// On show callback.
  onShow = () => {}

  /// On hide callback.
  onHide = () => {}

  constructor(options: TooltipProviderOptions) {
    this.element = options.content
    this.#debounce = options.debounce ?? 200
    this.#shouldShow = options.shouldShow ?? this.#_shouldShow
    this.#offset = options.offset
    this.element.dataset.show = 'false'
  }

  /// @internal
  #onUpdate = (view: EditorView, prevState?: EditorState): void => {
    const { state, composing } = view
    const { selection, doc } = state
    const { ranges } = selection
    const from = Math.min(...ranges.map(range => range.$from.pos))
    const to = Math.max(...ranges.map(range => range.$to.pos))
    const isSame = prevState && prevState.doc.eq(doc) && prevState.selection.eq(selection)

    if (!this.#initialized) {
      view.dom.parentElement?.appendChild(this.element)
      this.#initialized = true
    }

    if (composing || isSame)
      return

    if (!this.#shouldShow(view, prevState)) {
      this.hide()
      return
    }

    const virtualEl: VirtualElement = {
      getBoundingClientRect: () => posToDOMRect(view, from, to),
    }
    computePosition(virtualEl, this.element, {
      placement: 'top',
      middleware: [flip(), offset(this.#offset)],
    })
      .then(({ x, y }) => {
        Object.assign(this.element.style, {
          left: `${x}px`,
          top: `${y}px`,
        })
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
  destroy = () => {}

  /// Show the tooltip.
  show = (virtualElement?: VirtualElement) => {
    this.element.dataset.show = 'true'

    if (virtualElement) {
      computePosition(virtualElement, this.element, {
        placement: 'top',
        middleware: [flip(), offset(this.#offset)],
      })
        .then(({ x, y }) => {
          Object.assign(this.element.style, {
            left: `${x}px`,
            top: `${y}px`,
          })
        })
    }

    this.onShow()
  }

  /// Hide the tooltip.
  hide = () => {
    if (this.element.dataset.show === 'false')
      return
    this.element.dataset.show = 'false'

    this.onHide()
  }
}
