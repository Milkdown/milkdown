/* Copyright 2021, Milkdown by Mirone. */
import type { MarkType, Node as ProseNode } from 'prosemirror-model';

import type { Predicate } from './types';

export type NodeWithPos = { pos: number; node: ProseNode };

export const flatten = (node: ProseNode, descend = true): NodeWithPos[] => {
    const result: NodeWithPos[] = [];
    node.descendants((child, pos) => {
        result.push({ node: child, pos });
        if (!descend) {
            return false;
        }
        return undefined;
    });
    return result;
};

export const findChildren =
    (predicate: Predicate) =>
    (node: ProseNode, descend?: boolean): NodeWithPos[] =>
        flatten(node, descend).filter((child) => predicate(child.node));

export const findChildrenByMark = (node: ProseNode, markType: MarkType, descend?: boolean): NodeWithPos[] =>
    findChildren((child) => Boolean(markType.isInSet(child.marks)))(node, descend);
