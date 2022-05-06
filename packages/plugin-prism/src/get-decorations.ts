/* Copyright 2021, Milkdown by Mirone. */
import { findChildren } from '@milkdown/prose';
import { Node } from '@milkdown/prose/model';
import { Decoration, DecorationSet } from '@milkdown/prose/view';
import type { RefractorElement, Text } from 'refractor/lib/common';
import type { Refractor } from 'refractor/lib/core';

export type FlattedNode = {
    text: string;
    className: string[];
};

type RefractorNode = RefractorElement | Text;

const flatNodes = (nodes: RefractorNode[], className: string[] = []) =>
    nodes.flatMap((node): FlattedNode[] =>
        node.type === 'element'
            ? flatNodes(node.children, [...className, ...((node.properties?.['className'] as string[]) || [])])
            : [{ text: node.value, className }],
    );

export function getDecorations(doc: Node, name: string, refractor: Refractor) {
    const { highlight, listLanguages } = refractor;
    const allLanguages = listLanguages();
    const decorations: Decoration[] = [];

    findChildren((node) => node.type.name === name)(doc).forEach((block) => {
        let from = block.pos + 1;
        const { language } = block.node.attrs;
        if (!language || !allLanguages.includes(language)) {
            console.warn('Unsupported language detected, this language has not been supported by prism: ', language);
            return;
        }
        const nodes = highlight(block.node.textContent, language);

        flatNodes(nodes.children).forEach((node) => {
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
