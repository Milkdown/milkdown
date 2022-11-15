/* Copyright 2021, Milkdown by Mirone. */
import { expectDomTypeError, missingRootElement } from '@milkdown/exception'

import type { EditorView } from '../../view'

type Point = [top: number, left: number]

export const calculateNodePosition = (
  view: EditorView,
  target: HTMLElement,
  handler: (selectedRect: DOMRect, targetRect: DOMRect, parentRect: DOMRect) => Point,
) => {
  const state = view.state
  const { from } = state.selection

  const { node } = view.domAtPos(from)
  const element = node instanceof Text ? node.parentElement : node
  if (!(element instanceof HTMLElement))
    throw expectDomTypeError(element)

  const selectedNodeRect = element.getBoundingClientRect()
  const targetNodeRect = target.getBoundingClientRect()
  const parent = target.parentElement
  if (!parent)
    throw expectDomTypeError(parent)

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

export const calculateTextPosition = (
  view: EditorView,
  target: HTMLElement,
  handler: (start: Rect, end: Rect, targetRect: DOMRect, parentRect: DOMRect) => Point,
) => {
  const state = view.state
  const { from, to } = state.selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)

  const targetNodeRect = target.getBoundingClientRect()
  const parent = target.parentElement
  if (!parent)
    throw missingRootElement()

  const parentNodeRect = parent.getBoundingClientRect()

  const [top, left] = handler(start, end, targetNodeRect, parentNodeRect)

  target.style.top = `${top}px`
  target.style.left = `${left}px`
}
