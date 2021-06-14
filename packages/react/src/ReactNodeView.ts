import { Node as ProsemirrorNode } from 'prosemirror-model';
import { NodeView, Decoration } from 'prosemirror-view';

export function id() {
    return [1e7, -1e3, -4e3, -8e3, -1e11]
        .map((x) => x.toString())
        .join('')
        .replace(/[018]/g, (c) =>
            (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
        );
}

abstract class NodeViewBase implements NodeView {
    abstract get dom(): Node | null;
    abstract get contentDOM(): Node | null;

    abstract update?: Required<NodeView>['update'];

    abstract destroy?: Required<NodeView>['destroy'];
}

export class ReactNodeView extends NodeViewBase {
    override get dom(): Node | null {
        throw new Error('To be implemented');
    }
    override get contentDOM(): Node | null {
        if (this.#node.isLeaf) return null;

        return this.#contentDOMElement;
    }

    #node: ProsemirrorNode;
    #decorations: Decoration[];
    #contentDOMElement: HTMLElement | null;
    #getPos: () => number;

    constructor(node: ProsemirrorNode, decorations: Decoration[], getPos: () => number) {
        super();
        this.#node = node;
        this.#decorations = decorations;
        this.#getPos = getPos;

        // TODO: remove HACK
        this.#getPos;

        this.#contentDOMElement = this.#node.isLeaf
            ? null
            : document.createElement(this.#node.isInline ? 'span' : 'div');
    }

    override update = (node: ProsemirrorNode, decorations: Decoration[]) => {
        if (node.type !== this.#node.type) {
            return false;
        }

        if (node === this.#node && this.#decorations === decorations) {
            return true;
        }

        this.#node = node;
        this.#decorations = decorations;

        return true;
    };

    override destroy = () => {
        this.#contentDOMElement = null;
    };
}
