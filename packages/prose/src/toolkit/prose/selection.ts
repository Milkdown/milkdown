/* Copyright 2021, Milkdown by Mirone. */
import type { Node as ProseNode, NodeType, ResolvedPos } from 'prosemirror-model';
import { NodeSelection, Selection } from 'prosemirror-state';

import { equalNodeType } from './helper';
import type { Predicate } from './types';

export type ContentNodeWithPos = { pos: number; start: number; depth: number; node: ProseNode };

export const findParentNodeClosestToPos =
    (predicate: Predicate) =>
    ($pos: ResolvedPos): ContentNodeWithPos | undefined => {
        for (let i = $pos.depth; i > 0; i--) {
            const node = $pos.node(i);
            if (predicate(node)) {
                return {
                    pos: i > 0 ? $pos.before(i) : 0,
                    start: $pos.start(i),
                    depth: i,
                    node,
                };
            }
        }
        return;
    };

export const findParentNode =
    (predicate: Predicate) =>
    (selection: Selection): ContentNodeWithPos | undefined => {
        return findParentNodeClosestToPos(predicate)(selection.$from);
    };

export const findSelectedNodeOfType = (selection: Selection, nodeType: NodeType): ContentNodeWithPos | undefined => {
    if (!(selection instanceof NodeSelection)) {
        return;
    }
    const { node, $from } = selection;
    if (equalNodeType(nodeType, node)) {
        return { node, pos: $from.pos, start: $from.start($from.depth), depth: $from.depth };
    }
    return undefined;
};
