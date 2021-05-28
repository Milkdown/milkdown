import type { Attrs } from './types';
import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';

import { maybeMerge } from '../utility/prosemirror';

type StackElement = {
    type: NodeType;
    attrs?: Attrs;
    content: Node[];
};

export class Stack {
    public readonly els: StackElement[];
    #marks: Mark[];

    constructor(nodeType: NodeType) {
        this.els = [{ type: nodeType, content: [] }];
        this.#marks = Mark.none;
    }

    #top() {
        const { els } = this;
        return els[els.length - 1];
    }

    #pushInTopEl(el: Node) {
        this.#top()?.content.push(el);
    }

    get length() {
        return this.els.length;
    }

    openMark(mark: Mark) {
        this.#marks = mark.addToSet(this.#marks);
    }

    closeMark(mark: MarkType) {
        this.#marks = mark.removeFromSet(this.#marks);
    }

    addText(createTextNode: (marks: Mark[]) => Node) {
        const top = this.#top();
        if (!top) throw new Error();

        const nodes = top.content;
        const last = nodes[nodes.length - 1];
        const node = createTextNode(this.#marks);

        const merged = last && maybeMerge(last, node);
        if (merged) {
            nodes[nodes.length - 1] = merged;
            return;
        }

        nodes.push(node);
    }

    openNode(nodeType: NodeType, attrs?: Attrs) {
        this.els.push({ type: nodeType, attrs, content: [] });
    }

    addNode(nodeType: NodeType, attrs?: Attrs, content?: Node[]) {
        const node = nodeType.createAndFill(attrs, content, this.#marks);

        if (!node) return null;

        this.#pushInTopEl(node);
        return node;
    }

    closeNode() {
        if (this.#marks.length) this.#marks = Mark.none;

        const info = this.els.pop();
        if (!info) throw new Error();

        return this.addNode(info.type, info.attrs, info.content);
    }
}
