import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { maybeMerge } from '../utility/prosemirror';
import type { Attrs } from './types';

class StackElement {
    constructor(public type: NodeType, public content: Node[], public attrs?: Attrs) {}

    static create(type: NodeType, content: Node[], attrs?: Attrs) {
        return new this(type, content, attrs);
    }

    get length(): number {
        return this.content.length;
    }

    push(node: Node, ...rest: Node[]): void {
        this.content.push(node, ...rest);
    }

    pop(): Node | undefined {
        return this.content.pop();
    }
}

type Ctx = {
    marks: Mark[];
    readonly elementStack: StackElement[];
};

const size = (ctx: Ctx): number => ctx.elementStack.length;

const top = (ctx: Ctx): StackElement | undefined => ctx.elementStack[size(ctx) - 1];

const push = (ctx: Ctx) => (node: Node) => top(ctx)?.push(node);

const openNode = (ctx: Ctx) => (nodeType: NodeType, attrs?: Attrs) =>
    ctx.elementStack.push(StackElement.create(nodeType, [], attrs));

const addNode =
    (ctx: Ctx) =>
    (nodeType: NodeType, attrs?: Attrs, content?: Node[]): Node => {
        const node = nodeType.createAndFill(attrs, content, ctx.marks);

        if (!node) throw new Error();

        push(ctx)(node);

        return node;
    };

const closeNode = (ctx: Ctx) => () => {
    ctx.marks = Mark.none;
    const element = ctx.elementStack.pop();

    if (!element) throw new Error();

    return addNode(ctx)(element.type, element.attrs, element.content);
};

const openMark = (ctx: Ctx) => (markType: MarkType, attrs?: Attrs) => {
    const mark = markType.create(attrs);

    ctx.marks = mark.addToSet(ctx.marks);
};

const closeMark = (ctx: Ctx) => (markType: MarkType) => {
    ctx.marks = markType.removeFromSet(ctx.marks);
};

const addText = (ctx: Ctx) => (createTextNode: (marks: Mark[]) => Node) => {
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

export const createStack = (rootNodeType: NodeType) => {
    const topNode = StackElement.create(rootNodeType, []);
    const ctx: Ctx = {
        marks: [],
        elementStack: [topNode],
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
