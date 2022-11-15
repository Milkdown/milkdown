/* Copyright 2021, Milkdown by Mirone. */
import type { Mark as ProseMark, Node as ProseNode } from '@milkdown/prose/model'

import type { State } from './state'

export interface NodeSerializerSpec {
  match: (node: ProseNode) => boolean
  runner: (state: State, node: ProseNode) => void
}
export interface MarkSerializerSpec {
  match: (mark: ProseMark) => boolean
  runner: (state: State, mark: ProseMark, node: ProseNode) => void | boolean
}
export type SerializerSpec = NodeSerializerSpec | MarkSerializerSpec

export type InnerSerializerSpecMap = Record<string, SerializerSpec>
