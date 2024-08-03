import type { html } from 'atomico'
import type { Ctx } from '@milkdown/kit/ctx'
import type { Command, Transaction } from '@milkdown/kit/prose/state'
import type { Attrs, NodeType } from '@milkdown/kit/prose/model'
import { findWrapping } from '@milkdown/kit/prose/transform'

export interface MenuItem {
  index: number
  key: string
  label: string
  icon: ReturnType<typeof html>
  onRun: (ctx: Ctx) => void
}

type WithRange<T, HasIndex extends true | false = true> = HasIndex extends true ? T & { range: [start: number, end: number] } : T

export type MenuItemGroup<HasIndex extends true | false = true> = WithRange<{
  key: string
  label: string
  items: HasIndex extends true ? MenuItem[] : Omit<MenuItem, 'index'>[]
}, HasIndex>

export function clearRange(tr: Transaction) {
  const { $from, $to } = tr.selection
  const { pos: from } = $from
  const { pos: to } = $to
  tr = tr.deleteRange(from - $from.node().content.size, to)
  return tr
}

export function setBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const { from, to } = tr.selection
  return tr.setBlockType(from, to, nodeType, attrs)
}

export function wrapInBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const { $from, $to } = tr.selection

  const range = $from.blockRange($to)
  const wrapping = range && findWrapping(range, nodeType, attrs)
  if (!wrapping)
    return null

  return tr.wrap(range, wrapping)
}

export function addBlockType(tr: Transaction, nodeType: NodeType, attrs: Attrs | null = null) {
  const node = nodeType.createAndFill(attrs)
  if (!node)
    return null

  return tr.replaceSelectionWith(node)
}

export function clearContentAndSetBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = setBlockType(clearRange(state.tr), nodeType, attrs)
      dispatch(tr.scrollIntoView())
    }
    return true
  }
}

export function clearContentAndWrapInBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const tr = wrapInBlockType(clearRange(state.tr), nodeType, attrs)
    if (!tr)
      return false

    if (dispatch)
      dispatch(tr.scrollIntoView())

    return true
  }
}

export function clearContentAndAddBlockType(nodeType: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const tr = addBlockType(clearRange(state.tr), nodeType, attrs)
    if (!tr)
      return false

    if (dispatch)
      dispatch(tr.scrollIntoView())

    return true
  }
}
