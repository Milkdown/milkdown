import { Decoration, DecorationSet } from 'prosemirror-view';
import { Node } from 'prosemirror-model';
import { highlight, RefractorNode } from 'refractor';
import { findBlockNodes } from './utility';

const cache: Record<number, { node: Node; dec: Decoration[] }> = {};

export type FlattedNode = {
    text: string;
    className: string[];
};

export function getDecorations(doc: Node, name: string) {
    const decorations: Decoration[] = [];
    const blocks = findBlockNodes(doc).filter((item) => item.node.type.name === name);

    blocks.forEach((block) => {
        let startPos = block.pos + 1;
        const language = block.node.attrs.language;
        if (!language) return;

        if (!cache[block.pos] || !cache[block.pos].node.eq(block.node)) {
            const nodes: RefractorNode[] = highlight(block.node.textContent, language);
            const flatNodes = (nodes: RefractorNode[], className: string[] = []) =>
                nodes.flatMap((node): FlattedNode[] =>
                    node.type === 'element'
                        ? flatNodes(node.children, [...className, ...(node.properties.className || [])])
                        : [{ text: node.value, className }],
                );
            const dec = flatNodes(nodes).map(({ text, className }) => {
                const from = startPos;
                const to = from + text.length;
                startPos = to;
                return Decoration.inline(from, to, { class: className.join(' ') });
            });
            cache[block.pos] = {
                node: block.node,
                dec,
            };
        }

        cache[block.pos].dec.forEach((dec) => {
            decorations.push(dec);
        });
    });
    Object.keys(cache)
        .filter((pos) => {
            return !blocks.find((block) => block.pos === Number(pos));
        })
        .forEach((pos) => {
            delete cache[Number(pos)];
        });

    return DecorationSet.create(doc, decorations);
}
