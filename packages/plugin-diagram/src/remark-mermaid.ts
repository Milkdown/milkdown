/* Copyright 2021, Milkdown by Mirone. */

import { remarkPluginFactory } from '@milkdown/core';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const createMermaidDiv = (contents: string) => ({
    type: 'diagram',
    value: contents,
});

const visitCodeBlock = (ast: Node) =>
    visit(ast, 'code', (node, index, parent) => {
        const { lang, value } = node;

        // If this codeblock is not mermaid, bail.
        if (lang !== 'mermaid') {
            return node;
        }

        const newNode = createMermaidDiv(value);

        if (parent && index) {
            parent.children.splice(index, 1, newNode);
        }

        return node;
    });

const mermaidPlugin = () => {
    function transformer(tree: Node) {
        visitCodeBlock(tree);
    }

    return transformer;
};

export const remarkPlugin = remarkPluginFactory(mermaidPlugin);
