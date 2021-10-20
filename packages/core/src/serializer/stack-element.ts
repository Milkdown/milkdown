/* Copyright 2021, Milkdown by Mirone. */
import type { MarkdownNode } from '..';
import type { JSONRecord } from '../utility';

export type StackElement = {
    type: string;
    value?: string;
    props: JSONRecord;
    children?: MarkdownNode[];
    push: (node: MarkdownNode, ...rest: MarkdownNode[]) => void;
    pop: () => MarkdownNode | undefined;
};

const pushElement = (element: StackElement, node: MarkdownNode, ...rest: MarkdownNode[]) => {
    if (!element.children) {
        element.children = [];
    }
    element.children.push(node, ...rest);
};

const popElement = (element: StackElement): MarkdownNode | undefined => element.children?.pop();

export const createElement = (
    type: string,
    children?: MarkdownNode[],
    value?: string,
    props: JSONRecord = {},
): StackElement => {
    const element: StackElement = {
        type,
        children,
        props,
        value,
        push: (...args) => pushElement(element, ...args),
        pop: () => popElement(element),
    };
    return element;
};
