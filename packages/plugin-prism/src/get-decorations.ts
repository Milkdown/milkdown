/* Copyright 2021, Milkdown by Mirone. */
import { Decoration, DecorationSet, findChildren, Node } from '@milkdown/prose';
import { highlight, RefractorNode } from 'refractor';

export type FlattedNode = {
    text: string;
    className: string[];
};

const flatNodes = (nodes: RefractorNode[], className: string[] = []) =>
    nodes.flatMap((node): FlattedNode[] =>
        node.type === 'element'
            ? flatNodes(node.children, [...className, ...(node.properties.className || [])])
            : [{ text: node.value, className }],
    );

export function getDecorations(doc: Node, name: string) {
    const decorations: Decoration[] = [];

    findChildren((node) => node.type.name === name)(doc).forEach((block) => {
        let from = block.pos + 1;
        const { language } = block.node.attrs;
        const nodes = highlight(block.node.textContent, language || 'shell');

        flatNodes(nodes).forEach((node) => {
            const to = from + node.text.length;

            if (node.className.length) {
                const decoration = Decoration.inline(from, to, {
                    class: node.className.join(' '),
                });

                decorations.push(decoration);
            }

            from = to;
        });
    });

    return DecorationSet.create(doc, decorations);
}
