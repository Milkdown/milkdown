/* Copyright 2021, Milkdown by Mirone. */
import type { NodeWithPos } from '@milkdown/prose'
import { findChildren } from '@milkdown/prose'
import type { Node } from '@milkdown/prose/model'

export const findBlockNodes: (node: Node, descend?: boolean | undefined) => NodeWithPos[] = findChildren(
  child => child.isBlock,
)
