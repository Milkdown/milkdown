/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { Node, ResolvedPos } from '@milkdown/prose/model';
import { EditorView } from '@milkdown/prose/view';

import { FilterNodes } from './create-block-plugin';
import { getDOMByPos } from './get-dom-by-pos';

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

export type ActiveNode = Readonly<{
    $pos: ResolvedPos;
    node: Node;
    el: HTMLElement;
}>;

export const selectRootNodeByDom = (dom: Element, view: EditorView, filterNodes: FilterNodes): ActiveNode | null => {
    const root = view.dom.parentElement;
    if (!root) {
        throw missingRootElement();
    }

    const pos = view.posAtDOM(dom, 0);
    if (pos === 0) return null;

    let $pos = view.state.doc.resolve(pos);
    let node = $pos.node();

    while (node && (nodeIsNotBlock(node) || nodeIsFirstChild($pos) || !filterNodes(node))) {
        $pos = view.state.doc.resolve($pos.before());
        node = $pos.node();
    }

    $pos = view.state.doc.resolve($pos.pos - $pos.parentOffset);

    const el = getDOMByPos(view, root, $pos);

    return { node, $pos, el };
};
