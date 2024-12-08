import { expectDomTypeError, missingRootElement } from '@milkdown/exception'

import type { EditorView } from '../../view'

type Point = [top: number, left: number]

export function calculateNodePosition(
  view: EditorView,
  target: HTMLElement,
  handler: (
    selectedRect: DOMRect,
    targetRect: DOMRect,
    parentRect: DOMRect
  ) => Point
) {
  const state = view.state
  const { from } = state.selection

  const { node } = view.domAtPos(from)
  const element = node instanceof Text ? node.parentElement : node
  if (!(element instanceof HTMLElement)) throw expectDomTypeError(element)

  const selectedNodeRect = element.getBoundingClientRect()
  const targetNodeRect = target.getBoundingClientRect()
  const parent = target.parentElement
  if (!parent) throw expectDomTypeError(parent)

  const parentNodeRect = parent.getBoundingClientRect()

  const [top, left] = handler(selectedNodeRect, targetNodeRect, parentNodeRect)

  target.style.top = `${top}px`
  target.style.left = `${left}px`
}

interface Rect {
  left: number
  right: number
  top: number
  bottom: number
}

export function calculateTextPosition(
  view: EditorView,
  target: HTMLElement,
  handler: (
    start: Rect,
    end: Rect,
    targetRect: DOMRect,
    parentRect: DOMRect
  ) => Point
) {
  const state = view.state
  const { from, to } = state.selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)

  const targetNodeRect = target.getBoundingClientRect()
  const parent = target.parentElement
  if (!parent) throw missingRootElement()

  const parentNodeRect = parent.getBoundingClientRect()

  const [top, left] = handler(start, end, targetNodeRect, parentNodeRect)

  target.style.top = `${top}px`
  target.style.left = `${left}px`
}

function minMax(value = 0, min = 0, max = 0): number {
  return Math.min(Math.max(value, min), max)
}

export function posToDOMRect(
  view: EditorView,
  from: number,
  to: number
): DOMRect {
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
