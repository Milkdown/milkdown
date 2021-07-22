import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { maybeMerge, getStackUtil } from '../utility';
import { createElement, StackElement } from './stack-element';
import type { Attrs } from './types';

type Ctx = {
    marks: Mark[];
    readonly elements: StackElement[];
};

const { size, push, top, open, close } = getStackUtil<Node, StackElement, Ctx>();

const openNode = (ctx: Ctx) => (nodeType: NodeType, attrs?: Attrs) => open(ctx)(createElement(nodeType, [], attrs));

const addNode =
    (ctx: Ctx) =>
    (nodeType: NodeType, attrs?: Attrs, content?: Node[]): Node => {
        const node = nodeType.createAndFill(attrs, content, ctx.marks);

        if (!node) throw new Error();

        push(ctx)(node);

        return node;
    };

const closeNode = (ctx: Ctx) => (): Node => {
    ctx.marks = Mark.none;
    const element = close(ctx);

    return addNode(ctx)(element.type, element.attrs, element.content);
};

const openMark =
    (ctx: Ctx) =>
    (markType: MarkType, attrs?: Attrs): void => {
        const mark = markType.create(attrs);

        ctx.marks = mark.addToSet(ctx.marks);
    };

const closeMark =
    (ctx: Ctx) =>
    (markType: MarkType): void => {
        ctx.marks = markType.removeFromSet(ctx.marks);
    };

const addText =
    (ctx: Ctx) =>
    (createTextNode: (marks: Mark[]) => Node): void => {
        const topElement = top(ctx);
        if (!topElement) throw new Error();

        const prevNode = topElement.pop();
        const currNode = createTextNode(ctx.marks);

        if (!prevNode) {
            topElement.push(currNode);
            return;
        }

        const merged = maybeMerge(prevNode, currNode);
        if (merged) {
            topElement.push(merged);
            return;
        }
        topElement.push(prevNode, currNode);
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
        addText: addText(ctx),
        openNode: openNode(ctx),
        addNode: addNode(ctx),
        closeNode: closeNode(ctx),
    };
};

export type Stack = ReturnType<typeof createStack>;
