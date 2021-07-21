import { MarkdownNode } from '..';
import { AnyRecord } from '../utility';

export type StackElement = {
    type: string;
    value?: string;
    props: AnyRecord;
    children?: MarkdownNode[];
    push: (node: MarkdownNode, ...rest: MarkdownNode[]) => void;
    pop: () => MarkdownNode | undefined;
};

type StackValues = Pick<StackElement, 'children' | 'props' | 'value' | 'type'>;

const pushElement = (element: StackValues, node: MarkdownNode, ...rest: MarkdownNode[]) => {
    element.children?.push(node, ...rest);
};

const popElement = (element: StackValues): MarkdownNode | undefined => element.children?.pop();

export const createElement = (
    type: string,
    children?: MarkdownNode[],
    value?: string,
    props: AnyRecord = {},
): StackElement => {
    const element: StackValues = {
        type,
        children,
        props,
        value,
    };
    return {
        ...element,
        push: (...args) => pushElement(element, ...args),
        pop: () => popElement(element),
    };
};
