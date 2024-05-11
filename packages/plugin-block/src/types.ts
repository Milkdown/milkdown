import type { Node, ResolvedPos } from '@milkdown/prose/model'

export type ActiveNode = Readonly<{
  $pos: ResolvedPos
  node: Node
  el: HTMLElement
}>
