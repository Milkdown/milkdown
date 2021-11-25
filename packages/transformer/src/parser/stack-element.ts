/* Copyright 2021, Milkdown by Mirone. */
import { Node, NodeType } from '@milkdown/prose';

import type { Attrs } from './types';

export type StackElement = {
    type: NodeType;
    content: Node[];
    attrs?: Attrs;
    push: (node: Node, ...rest: Node[]) => void;
    pop: () => Node | undefined;
};

const pushElement = (element: StackElement, node: Node, ...rest: Node[]) => {
    element.content.push(node, ...rest);
};

const popElement = (element: StackElement): Node | undefined => element.content.pop();

export const createElement = (type: NodeType, content: Node[], attrs?: Attrs): StackElement => {
    const element: StackElement = {
        type,
        content,
        attrs,
        push: (...args) => pushElement(element, ...args),
        pop: () => popElement(element),
    };
    return element;
};
