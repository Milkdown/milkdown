/* Copyright 2021, Milkdown by Mirone. */
import { findParentNode, posToDOMRect } from '@milkdown/prose'
import type { EditorState } from '@milkdown/prose/state'
import { TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import debounce from 'lodash.debounce'
import type { Instance, Props } from 'tippy.js'
import tippy from 'tippy.js'

export type SlashProviderOptions = {
  content: HTMLElement
  tippyOptions?: Partial<Props>
  debounce?: number
  shouldShow?: (view: EditorView, prevState?: EditorState) => boolean
}

export class SlashProvider {
  #tippy: Instance | undefined

  #element: HTMLElement

  #tippyOptions: Partial<Props>

  #debounce: number

  #shouldShow: (view: EditorView, prevState?: EditorState) => boolean

  constructor(options: SlashProviderOptions) {
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
      placement: 'bottom-start',
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

  getContent = (view: EditorView): string | undefined => {
    const { selection } = view.state
    const { $from, empty } = selection
    const isTextBlock = view.state.selection instanceof TextSelection

    const isSlashChildren = this.#element.contains(document.activeElement)

    const notHasFocus = !view.hasFocus() && !isSlashChildren

    const isReadonly = !view.editable

    const paragraph = findParentNode(({ type }) => type.name === 'paragraph')(view.state.selection)

    const isNotInParagraph = !paragraph
      || paragraph.node.childCount > 1
      || $from.parentOffset !== paragraph.node.textContent.length
      || paragraph.node.firstChild?.type.name !== 'text'

    if (notHasFocus || isReadonly || !empty || !isTextBlock || isNotInParagraph)
      return

    const currentTextBlockContent = paragraph.node.textContent

    return currentTextBlockContent
  }

  #_shouldShow(view: EditorView): boolean {
    const currentTextBlockContent = this.getContent(view)

    if (!currentTextBlockContent)
      return false

    return currentTextBlockContent.at(-1) === '/'
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
