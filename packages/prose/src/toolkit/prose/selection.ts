import type { NodeType, Node as ProseNode, ResolvedPos } from '../../model'
import type { Selection } from '../../state'
import { NodeSelection } from '../../state'
import { equalNodeType } from './helper'
import type { Predicate } from './types'

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
