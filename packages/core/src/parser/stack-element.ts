import { Node, NodeType } from 'prosemirror-model';
import type { Attrs } from './types';

export type StackElement = {
    type: NodeType;
    content: Node[];
    attrs?: Attrs;
    push: (node: Node, ...rest: Node[]) => void;
    pop: () => Node | undefined;
};

type StackValues = Pick<StackElement, 'type' | 'content' | 'attrs'>;

const pushElement = (element: StackValues, node: Node, ...rest: Node[]) => {
    element.content.push(node, ...rest);
};

const popElement = (element: StackValues): Node | undefined => element.content.pop();

export const createElement = (type: NodeType, content: Node[], attrs?: Attrs): StackElement => {
    const element: StackValues = {
        type,
        content,
        attrs,
    };
    return {
        ...element,
        push: (...args) => pushElement(element, ...args),
        pop: () => popElement(element),
    };
};
