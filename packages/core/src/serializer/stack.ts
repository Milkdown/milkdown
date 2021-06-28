import { Node as MarkdownNode } from 'unist';
import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { maybeMerge } from '../utility/prosemirror';
import { createElement, StackElement } from './stack-element';
import { AnyRecord } from '../utility';

type Ctx = {
    marks: Mark[];
    readonly elements: StackElement[];
};

const createMarkdownNode = (element: StackElement) => {
    const node: MarkdownNode = {
        ...element.props,
        type: element.type,
    };

    if (element.children) {
        node.children = element.children;
    }

    if (element.value) {
        node.value = element.value;
    }

    return node;
};

const size = (ctx: Ctx): number => ctx.elements.length;

const top = (ctx: Ctx): StackElement | undefined => ctx.elements[size(ctx) - 1];

const push = (ctx: Ctx) => (node: MarkdownNode) => top(ctx)?.push(node);

const openNode = (ctx: Ctx) => (type: string, value?: string, props?: AnyRecord) =>
    ctx.elements.push(createElement(type, [], value, props));

const addNode =
    (ctx: Ctx) =>
    (type: string, children?: MarkdownNode[], value?: string, props?: AnyRecord): MarkdownNode => {
        const element = createElement(type, children, value, props);
        const node: MarkdownNode = createMarkdownNode(element);

        push(ctx)(node);

        return node;
    };

const closeNode = (ctx: Ctx) => (): MarkdownNode => {
    ctx.marks = Mark.none;
    const element = ctx.elements.pop();

    if (!element) throw new Error();

    return addNode(ctx)(element.type, element.children, element.value, element.props);
};

const build = (ctx: Ctx) => () => {
    let doc: Node | null = null;
    do {
        doc = closeNode(ctx)();
    } while (size(ctx));

    return doc;
};

export const createStack = () => {
    const ctx: Ctx = {
        marks: [],
        elements: [],
    };

    return {
        build: build(ctx),
        openMark: openMark(ctx),
        closeMark: closeMark(ctx),
        openNode: openNode(ctx),
        addNode: addNode(ctx),
        closeNode: closeNode(ctx),
    };
};

export type Stack = ReturnType<typeof createStack>;
