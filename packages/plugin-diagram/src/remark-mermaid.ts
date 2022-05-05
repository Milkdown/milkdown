/* Copyright 2021, Milkdown by Mirone. */

import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';

const createMermaidDiv = (contents: string) => ({
    type: 'diagram',
    value: contents,
});

const visitCodeBlock = (ast: Node) =>
    visit(ast, 'code', (node, index, parent: Parent) => {
        const { lang, value } = node;

        // If this codeblock is not mermaid, bail.
        if (lang !== 'mermaid') {
            return node;
        }

        const newNode = createMermaidDiv(value);

        if (parent && index != null) {
            parent.children.splice(index, 1, newNode);
        }

        return node;
    });

export const remarkMermaid = () => {
    function transformer(tree: Node) {
        visitCodeBlock(tree);
    }

    return transformer;
};
