/* Copyright 2021, Milkdown by Mirone. */
import type { MilkdownPlugin } from '@milkdown/core'
import type { EditorState, PluginView } from '@milkdown/prose/state'
import { Plugin, PluginKey } from '@milkdown/prose/state'
import type { EditorView } from '@milkdown/prose/view'
import { $ctx, $prose } from '@milkdown/utils'
import type { Content, Instance } from 'tippy.js'
import tippy from 'tippy.js'

function minMax(value = 0, min = 0, max = 0): number {
  return Math.min(Math.max(value, min), max)
}

function posToDOMRect(view: EditorView, from: number, to: number): DOMRect {
  const minPos = 0
  const maxPos = view.state.doc.content.size
  const resolvedFrom = minMax(from, minPos, maxPos)
  const resolvedEnd = minMax(to, minPos, maxPos)
  const start = view.coordsAtPos(resolvedFrom)
  const end = view.coordsAtPos(resolvedEnd, -1)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const width = right - left
  const height = bottom - top
  const x = left
  const y = top
  const data = {
    top,
    bottom,
    left,
    right,
    width,
    height,
    x,
    y,
  }

  return {
    ...data,
    toJSON: () => data,
  }
}

function debounce<T extends unknown[]>(func: (...args: T) => void, timeout = 300) {
  let timer: number
  return (...args: T) => {
    clearTimeout(timer)
    timer = window.setTimeout(() => func(...args), timeout)
  }
}

export class TooltipProvider {
  #tippy: Instance | undefined

  #element: Content

  constructor(content: Content) {
    this.#element = content
  }

  update = debounce((view: EditorView, prevState?: EditorState) => {
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
      content: this.#element,
    })

    if (!this.shouldShow())
      this.hide()

    this.#tippy.setProps({
      getReferenceClientRect: () => {
        return posToDOMRect(view, from, to)
      },
    })

    this.show()
  }, 100)

  shouldShow() {
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
export const tooltipView = $ctx<TooltipViewFactory, 'tooltipView'>(() => ({}), 'tooltipView')

export const tooltipPlugin = $prose((ctx) => {
  const view = ctx.get(tooltipView.key)
  const plugin = new Plugin({
    key: new PluginKey('MILKDOWN_TOOLTIP'),
    view,
  })

  return plugin
})

export const tooltip: MilkdownPlugin[] = [tooltipView, tooltipPlugin]
