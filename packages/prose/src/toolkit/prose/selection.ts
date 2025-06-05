import type { NodeType, Node as ProseNode, ResolvedPos } from '../../model'
import type { EditorState, Selection } from '../../state'
import type { Predicate } from './types'

import { NodeSelection } from '../../state'
import { equalNodeType } from './helper'

export interface ContentNodeWithPos {
  pos: number
  start: number
  depth: number
  node: ProseNode
}

export function findParentNodeClosestToPos(predicate: Predicate) {
  return ($pos: ResolvedPos): ContentNodeWithPos | undefined => {
    for (let i = $pos.depth; i > 0; i--) {
      const node = $pos.node(i)
      if (predicate(node)) {
        return {
          pos: i > 0 ? $pos.before(i) : 0,
          start: $pos.start(i),
          depth: i,
          node,
        }
      }
    }

    return undefined
  }
}

export function findParentNode(predicate: Predicate) {
  return (selection: Selection): ContentNodeWithPos | undefined => {
    return findParentNodeClosestToPos(predicate)(selection.$from)
  }
}

export function findSelectedNodeOfType(
  selection: Selection,
  nodeType: NodeType
): ContentNodeWithPos | undefined {
  if (!(selection instanceof NodeSelection)) return

  const { node, $from } = selection
  if (equalNodeType(nodeType, node))
    return {
      node,
      pos: $from.pos,
      start: $from.start($from.depth),
      depth: $from.depth,
    }

  return undefined
}

export type FindNodeInSelectionResult = {
  hasNode: boolean
  pos: number
  target: ProseNode | null
}

export const findNodeInSelection = (
  state: EditorState,
  node: NodeType
): FindNodeInSelectionResult => {
  const { selection, doc } = state
  if (selection instanceof NodeSelection) {
    return {
      hasNode: selection.node.type === node,
      pos: selection.from,
      target: selection.node,
    }
  }

  const { from, to } = selection

  let hasNode = false
  let pos = -1
  let target: ProseNode | null = null
  doc.nodesBetween(from, to, (n, p) => {
    if (target) return false
    if (n.type === node) {
      hasNode = true
      pos = p
      target = n
      return false
    }
    return true
  })

  return {
    hasNode,
    pos,
    target,
  }
}
