/* Copyright 2021, Milkdown by Mirone. */
import { Literal, Node, Parent } from 'unist';

const isParent = (node: Node): node is Parent => !!(node as Parent).children;
const isHTML = (node: Node): node is Literal<string> => node.type === 'html';

function flatMapWithDepth(ast: Node, fn: (node: Node, index: number, parent: Node | null) => Node[]) {
    return transform(ast, 0, null)[0];

    function transform(node: Node, index: number, parent: Node | null) {
        if (isParent(node)) {
            const out = [];
            for (let i = 0, n = node.children.length; i < n; i++) {
                const xs = transform(node.children[i], i, node);
                if (xs) {
                    for (let j = 0, m = xs.length; j < m; j++) {
                        out.push(xs[j]);
                    }
                }
            }
            node.children = out;
        }

        return fn(node, index, parent);
    }
}

export const filterHTMLPlugin = () => {
    function transformer(tree: Node) {
        flatMapWithDepth(tree, (node) => {
            if (!isHTML(node)) {
                return [node];
            }

            return [];
        });
    }
    return transformer;
};
