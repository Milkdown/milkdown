import { findParentNode, posToDOMRect } from '@milkdown/prose'
import type { EditorState } from '@milkdown/prose/state'
import type { Node } from '@milkdown/prose/model'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'
import type { VirtualElement } from '@floating-ui/dom'
import { computePosition, flip, offset } from '@floating-ui/dom'

/// Options for slash provider.
export interface SlashProviderOptions {
  /// The slash content.
  content: HTMLElement
  /// The debounce time for updating slash, 200ms by default.
  debounce?: number
  /// The function to determine whether the tooltip should be shown.
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
  /// The key trigger for shouldShow, '/' by default.
  trigger?: string | string[]
  /// The offset to get the block. Default is 0.
  offset?: number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }
}

/// A provider for creating slash.
export class SlashProvider {
  /// The root element of the slash.
  element: HTMLElement

  /// @internal
  #initialized = false

  /// @internal
  readonly #debounce: number

  /// @internal
  readonly #trigger: string | string[]

  /// @internal
  readonly #shouldShow: (view: EditorView, prevState?: EditorState) => boolean

  /// The offset to get the block. Default is 0.
  readonly #offset?: number | {
    mainAxis?: number
    crossAxis?: number
    alignmentAxis?: number | null
  }

  /// On show callback.
  onShow = () => {}

  /// On hide callback.
  onHide = () => {}

  constructor(options: SlashProviderOptions) {
    this.element = options.content
    this.#debounce = options.debounce ?? 200
    this.#shouldShow = options.shouldShow ?? this.#_shouldShow
    this.#trigger = options.trigger ?? '/'
    this.#offset = options.offset
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
      placement: 'bottom-start',
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

  /// @internal
  #_shouldShow(view: EditorView): boolean {
    const currentTextBlockContent = this.getContent(view)

    if (!currentTextBlockContent)
      return false

    const target = currentTextBlockContent.at(-1)

    if (!target)
      return false

    return Array.isArray(this.#trigger) ? this.#trigger.includes(target) : this.#trigger === target
  }

  /// Update provider state by editor view.
  update = (view: EditorView, prevState?: EditorState): void => {
    const updater = debounce(this.#onUpdate, this.#debounce)

    updater(view, prevState)
  }

  /// Get the content of the current text block.
  /// Pass the `matchNode` function to determine whether the current node should be matched, by default, it will match the paragraph node.
  getContent = (view: EditorView, matchNode: (node: Node) => boolean = node => node.type.name === 'paragraph'): string | undefined => {
    const { selection } = view.state
    const { empty, $from } = selection
    const isTextBlock = view.state.selection instanceof TextSelection

    const isSlashChildren = this.element.contains(document.activeElement)

    const notHasFocus = !view.hasFocus() && !isSlashChildren

    const isReadonly = !view.editable

    const paragraph = findParentNode(matchNode)(view.state.selection)

    const isNotInParagraph = !paragraph

    if (notHasFocus || isReadonly || !empty || !isTextBlock || isNotInParagraph)
      return

    return $from.parent.textBetween(Math.max(0, $from.parentOffset - 500), $from.parentOffset, undefined, '\uFFFC')
  }

  /// Destroy the slash.
  destroy = () => {
  }

  /// Show the slash.
  show = () => {
    this.element.dataset.show = 'true'
    this.onShow()
  }

  /// Hide the slash.
  hide = () => {
    this.element.dataset.show = 'false'
    this.onHide()
  }
}
