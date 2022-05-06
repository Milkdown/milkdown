/* Copyright 2021, Milkdown by Mirone. */
import { findChildren, NodeWithPos } from '@milkdown/prose';
import { Node } from '@milkdown/prose/model';

export const findBlockNodes: (node: Node, descend?: boolean | undefined) => NodeWithPos[] = findChildren(
    (child) => child.isBlock,
);
