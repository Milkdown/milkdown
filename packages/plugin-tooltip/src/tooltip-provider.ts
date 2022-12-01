/* Copyright 2021, Milkdown by Mirone. */
import { posToDOMRect } from '@milkdown/prose'
import type { EditorState } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'

export type TooltipProviderOptions = {
  content: HTMLElement
  tippyOptions?: Partial<Props>
  debounce?: number
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

export class TooltipProvider {
  #tippy: Instance | undefined

  #element: HTMLElement

  #tippyOptions: Partial<Props>

  #debounce: number

  #shouldShow: (view: EditorView, prevState?: EditorState) => boolean

  constructor(options: TooltipProviderOptions) {
    this.#element = options.content
    this.#tippyOptions = options.tippyOptions ?? {}
    this.#debounce = options.debounce ?? 200
    this.#shouldShow = options.shouldShow ?? this.#_shouldShow
  }

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
      content: this.#element,
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

  update = (view: EditorView, prevState?: EditorState): void => {
    const updater = debounce(this.#onUpdate, this.#debounce)

    updater(view, prevState)
  }

  #_shouldShow(view: EditorView): boolean {
    const { doc, selection } = view.state
    const { empty, from, to } = selection

    const isEmptyTextBlock = !doc.textBetween(from, to).length && view.state.selection instanceof TextSelection

    const isTooltipChildren = this.#element.contains(document.activeElement)

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

  destroy = () => {
    this.#tippy?.destroy()
  }

  show = () => {
    this.#tippy?.show()
  }

  hide = () => {
    this.#tippy?.hide()
  }
}
