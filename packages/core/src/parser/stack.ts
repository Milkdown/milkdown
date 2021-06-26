import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { maybeMerge } from '../utility/prosemirror';
import type { Attrs } from './types';

type StackElement = {
    type: NodeType;
    attrs?: Attrs;
    content: Node[];
};

export class Stack {
    #marks: Mark[];

    readonly #els: StackElement[];

    constructor(rootNodeType: NodeType) {
        this.#els = [{ type: rootNodeType, content: [] }];
        this.#marks = Mark.none;
    }

    get length() {
        return this.#els.length;
    }

    // get element at top position in current stack
    #top = () => {
        return this.#els[this.length - 1];
    };

    #pushInTopEl(el: Node): void {
        this.#top()?.content.push(el);
    }

    buildDoc(): Node {
        let doc: Node | null = null;
        do {
            doc = this.closeNode();
        } while (this.length);

        return doc;
    }

    openMark(markType: MarkType, attrs?: Attrs): void {
        const mark = markType.create(attrs);

        this.#marks = mark.addToSet(this.#marks);
    }

    closeMark(markType: MarkType): void {
        this.#marks = markType.removeFromSet(this.#marks);
    }

    addText(createTextNode: (marks: Mark[]) => Node): void {
        const top = this.#top();
        if (!top) throw new Error();

        const nodes = top.content;
        const previousNode = nodes[nodes.length - 1];
        const currentNode = createTextNode(this.#marks);

        if (previousNode) {
            const merged = maybeMerge(previousNode, currentNode);
            if (merged) {
                nodes[nodes.length - 1] = merged;
                return;
            }
        }

        nodes.push(currentNode);
    }

    openNode(nodeType: NodeType, attrs?: Attrs): void {
        this.#els.push({ type: nodeType, attrs, content: [] });
    }

    addNode(nodeType: NodeType, attrs?: Attrs, content?: Node[]): Node {
        const node = nodeType.createAndFill(attrs, content, this.#marks);

        if (!node) throw new Error();
        this.#pushInTopEl(node);

        return node;
    }

    closeNode(): Node {
        if (this.#marks.length) this.#marks = Mark.none;

        const node = this.#els.pop();
        if (!node) throw new Error();

        return this.addNode(node.type, node.attrs, node.content);
    }
}
