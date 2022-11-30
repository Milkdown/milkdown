/* Copyright 2021, Milkdown by Mirone. */
import type { Slice } from '@milkdown/core'
import { posToDOMRect } from '@milkdown/prose'
import type { EditorState, PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import type { $Ctx, $Prose } from '@milkdown/utils'
import { $ctx, $prose } from '@milkdown/utils'
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

    if (from === to || composing || isSame)
      return

    this.#tippy ??= tippy(view.dom, {
      trigger: 'manual',
      ...this.#tippyOptions,
      content: this.#element,
    })

    if (!this.#shouldShow(view, prevState))
      this.hide()

    this.#tippy.setProps({
      getReferenceClientRect: () => {
        return posToDOMRect(view, from, to)
      },
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

export type TooltipViewFactory = (view: EditorView) => PluginView
type TooltipViewId<Id extends string> = `${Id}_TOOLTIP_VIEW`

export type TooltipPlugin<Id extends string> = [$Ctx<TooltipViewFactory, TooltipViewId<Id>>, $Prose] & {
  key: Slice<TooltipViewFactory, TooltipViewId<Id>>
  pluginKey: $Prose['key']
}

export const tooltipFactory = <Id extends string>(id: Id) => {
  const tooltipView = $ctx<TooltipViewFactory, TooltipViewId<Id>>(() => ({}), `${id}_TOOLTIP_VIEW`)
  const tooltipPlugin = $prose((ctx) => {
    const view = ctx.get(tooltipView.key)
    return new Plugin({
      key: new PluginKey(`${id}_TOOLTIP`),
      view,
    })
  })
  const result = [tooltipView, tooltipPlugin] as TooltipPlugin<Id>
  result.key = tooltipView.key
  result.pluginKey = tooltipPlugin.key

  return result
}

export const tooltip = tooltipFactory('MILKDOWN')
