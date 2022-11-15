/* Copyright 2021, Milkdown by Mirone. */
import type { NodeType, Node as ProseNode } from '../../model'
import type { Transaction } from '../../state'

export const cloneTr = (tr: Transaction): Transaction => {
  return Object.assign(Object.create(tr), tr).setTime(Date.now())
}

export const equalNodeType = (nodeType: NodeType | NodeType[], node: ProseNode) => {
  return (Array.isArray(nodeType) && nodeType.includes(node.type)) || node.type === nodeType
}
