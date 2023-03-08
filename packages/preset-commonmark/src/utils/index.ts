/* Copyright 2021, Milkdown by Mirone. */
import type { SerializerState } from '@milkdown/transformer'
import { Fragment } from '@milkdown/prose/model'
import type { Node } from '@milkdown/prose/model'
import { hardbreakSchema } from '../node'

export const serializeText = (state: SerializerState, node: Node) => {
  const lastIsHardBreak = node.childCount >= 1 && node.lastChild?.type === hardbreakSchema.type()
  if (!lastIsHardBreak) {
    state.next(node.content)
    return
  }

  const contentArr: Node[] = []
  node.content.forEach((n, _, i) => {
    if (i === node.childCount - 1)
      return

    contentArr.push(n)
  })
  state.next(Fragment.fromArray(contentArr))
}
