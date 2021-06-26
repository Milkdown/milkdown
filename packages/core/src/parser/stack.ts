import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { maybeMerge } from '../utility/prosemirror';
import type { Attrs } from './types';

type StackElement = {
    type: NodeType;
    content: Node[];
    attrs?: Attrs;
};

const createElement = (type: NodeType, content: Node[], attrs?: Attrs): StackElement => ({
    type,
    content,
    attrs,
});

const pushElement = (element: StackElement, node: Node, ...rest: Node[]) => {
    element.content.push(node, ...rest);
};

const popElement = (element: StackElement): Node | undefined => element.content.pop();

type Ctx = {
    marks: Mark[];
    readonly elements: StackElement[];
};

const size = (ctx: Ctx): number => ctx.elements.length;

const top = (ctx: Ctx): StackElement | undefined => ctx.elements[size(ctx) - 1];

const push = (ctx: Ctx) => (node: Node) => {
    const element = top(ctx);
    if (element) {
        pushElement(element, node);
    }
};

const openNode = (ctx: Ctx) => (nodeType: NodeType, attrs?: Attrs) =>
    ctx.elements.push(createElement(nodeType, [], attrs));

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
    const element = ctx.elements.pop();

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

    const prevNode = popElement(topElement);
    const currNode = createTextNode(ctx.marks);

    if (!prevNode) {
        pushElement(topElement, currNode);
        return;
    }

    const merged = maybeMerge(prevNode, currNode);
    if (merged) {
        pushElement(topElement, merged);
        return;
    }
    pushElement(topElement, prevNode, currNode);
};

const build = (ctx: Ctx) => () => {
    let doc: Node | null = null;
    do {
        doc = closeNode(ctx)();
    } while (size(ctx));

    return doc;
};

export const createStack = (rootNodeType: NodeType) => {
    const topNode = createElement(rootNodeType, []);
    const ctx: Ctx = {
        marks: [],
        elements: [topNode],
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
