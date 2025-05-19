import type { Slice, NodeType, Node as ProseNode } from '../../model'
import type { Transaction } from '../../state'

export function cloneTr(tr: Transaction): Transaction {
  return Object.assign(Object.create(tr), tr).setTime(Date.now())
}

export function equalNodeType(
  nodeType: NodeType | NodeType[],
  node: ProseNode
) {
  return (
    (Array.isArray(nodeType) && nodeType.includes(node.type)) ||
    node.type === nodeType
  )
}

export function isTextOnlySlice(slice: Slice): ProseNode | false {
  if (slice.content.childCount === 1) {
    const node = slice.content.firstChild
    if (node?.type.name === 'text' && node.marks.length === 0) return node

    if (node?.type.name === 'paragraph' && node.childCount === 1) {
      const _node = node.firstChild
      if (_node?.type.name === 'text' && _node.marks.length === 0) return _node
    }
  }

  return false
}
