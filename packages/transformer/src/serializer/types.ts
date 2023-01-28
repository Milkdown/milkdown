/* Copyright 2021, Milkdown by Mirone. */
import type { Mark as ProseMark, Node as ProseNode } from '@milkdown/prose/model'

import type { SerializerState } from './state'

export interface NodeSerializerSpec {
  match: (node: ProseNode) => boolean
  runner: (state: SerializerState, node: ProseNode) => void
}
export interface MarkSerializerSpec {
  match: (mark: ProseMark) => boolean
  runner: (state: SerializerState, mark: ProseMark, node: ProseNode) => void | boolean
}
