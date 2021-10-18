/* Copyright 2021, Milkdown by Mirone. */
import type { Node as ProseNode, NodeType } from '@milkdown/prose';
import type { Transaction } from '@milkdown/prose';

export const cloneTr = (tr: Transaction) => {
    return Object.assign(Object.create(tr), tr).setTime(Date.now());
};

export const equalNodeType = (nodeType: NodeType, node: ProseNode) => {
    return (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) || node.type === nodeType;
};
