/* Copyright 2021, Milkdown by Mirone. */
import type { Node, ResolvedPos } from '@milkdown/prose/model'
import type { EditorView } from '@milkdown/prose/view'

import type { FilterNodes } from '../block-plugin'
import type { ActiveNode } from '../types'
import { getDOMByPos } from './get-dom-by-pos'

const nodeIsNotBlock = (node: Node) => !node.type.isBlock
function nodeIsFirstChild(pos: ResolvedPos) {
  let parent = pos.parent
  const node = pos.node()

  if (parent === node)
    parent = pos.node(pos.depth - 1)

  if (!parent || parent.type.name === 'doc')
    return false

  return parent.firstChild === node
}

export function selectRootNodeByDom(dom: Element, view: EditorView, filterNodes: FilterNodes): ActiveNode | null {
  const root = view.dom.parentElement
  if (!root)
    return null

  const pos = view.posAtDOM(dom, 0)
  if (pos <= 0)
    return null

  let $pos = view.state.doc.resolve(pos)
  let node = $pos.node()

  if (node.type.name === 'doc') {
    const _node = view.state.doc.nodeAt(pos)
    if (!_node)
      return null

    node = _node
  }

  while (node && (nodeIsNotBlock(node) || nodeIsFirstChild($pos) || !filterNodes(node))) {
    $pos = view.state.doc.resolve($pos.before())
    node = $pos.node()
  }

  $pos = $pos.pos - $pos.parentOffset === 0 ? $pos : view.state.doc.resolve($pos.pos - $pos.parentOffset)

  const el = getDOMByPos(view, root, $pos)
  if (!el)
    return null

  return { node, $pos, el }
}
