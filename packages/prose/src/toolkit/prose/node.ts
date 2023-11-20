/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType, Node as ProseNode } from '../../model'
import type { Predicate } from './types'

export interface NodeWithPos { pos: number, node: ProseNode }

export function flatten(node: ProseNode, descend = true): NodeWithPos[] {
  const result: NodeWithPos[] = []
  node.descendants((child, pos) => {
    result.push({ node: child, pos })
    if (!descend)
      return false

    return undefined
  })
  return result
}

export function findChildren(predicate: Predicate) {
  return (node: ProseNode, descend?: boolean): NodeWithPos[] =>
    flatten(node, descend).filter(child => predicate(child.node))
}

export function findChildrenByMark(node: ProseNode, markType: MarkType, descend?: boolean): NodeWithPos[] {
  return findChildren(child => Boolean(markType.isInSet(child.marks)))(node, descend)
}
