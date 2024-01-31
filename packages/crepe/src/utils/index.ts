/* Copyright 2021, Milkdown by Mirone. */
import type { Selection } from '@milkdown/prose/state'

export function isInCodeBlock(selection: Selection) {
  const type = selection.$from.parent.type
  return type.name === 'code_block'
}

export function isInList(selection: Selection) {
  const type = selection.$from.node(selection.$from.depth - 1)?.type
  return type?.name === 'list_item'
}
