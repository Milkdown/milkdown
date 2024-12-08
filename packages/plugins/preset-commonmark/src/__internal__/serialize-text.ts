import type { SerializerState } from '@milkdown/transformer'
import type { Node } from '@milkdown/prose/model'
import { Fragment } from '@milkdown/prose/model'

export function serializeText(state: SerializerState, node: Node) {
  const lastIsHardBreak =
    node.childCount >= 1 && node.lastChild?.type.name === 'hardbreak'
  if (!lastIsHardBreak) {
    state.next(node.content)
    return
  }

  const contentArr: Node[] = []
  node.content.forEach((n, _, i) => {
    if (i === node.childCount - 1) return

    contentArr.push(n)
  })
  state.next(Fragment.fromArray(contentArr))
}
