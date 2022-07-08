/* Copyright 2021, Milkdown by Mirone. */
import { Node, ResolvedPos } from '@milkdown/prose/model';
import { EditorView } from '@milkdown/prose/view';

import { FilterNodes } from './create-block-plugin';

const nodeIsNotBlock = (node: Node) => !node.type.isBlock;
const nodeIsFirstChild = (pos: ResolvedPos) => {
    let parent = pos.parent;
    const node = pos.node();

    if (parent === node) {
        parent = pos.node(pos.depth - 1);
    }
    if (!parent || parent.type.name === 'doc') return false;

    return parent.firstChild === node;
};

export const selectRootNodeByDom = (dom: Element, view: EditorView, filterNodes: FilterNodes) => {
    const pos = view.posAtDOM(dom, 0);
    if (pos === 0) return;

    let $pos = view.state.doc.resolve(pos);
    let node = $pos.node();

    while (node && (nodeIsNotBlock(node) || nodeIsFirstChild($pos) || !filterNodes(node))) {
        $pos = view.state.doc.resolve($pos.before());
        node = $pos.node();
    }

    return { node, $pos } as const;
};
