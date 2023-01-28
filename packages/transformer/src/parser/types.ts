/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType, NodeType } from '@milkdown/prose/model'
import type { MarkdownNode } from '../utility/types'

import type { ParserState } from './state'

export type NodeParserSpec = {
  match: (node: MarkdownNode) => boolean
  runner: (state: ParserState, node: MarkdownNode, proseType: NodeType) => void
}
export type MarkParserSpec = {
  match: (node: MarkdownNode) => boolean
  runner: (state: ParserState, node: MarkdownNode, proseType: MarkType) => void
}
