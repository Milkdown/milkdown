import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { CommonNode } from '../utility/base';
import { Keymap, setBlockType } from 'prosemirror-commands';

export class Paragraph extends CommonNode {
    override readonly id = 'paragraph';
    override readonly schema: NodeSpec = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'p' }],
        toDOM: (node) => ['p', { class: this.getClassName(node.attrs) }, 0],
    };
    override readonly parser: NodeParserSpec = {
        match: (node) => node.type === this.id,
        runner: (state, node, type) => {
            state.openNode(type);
            if (node.children) {
                state.next(node.children);
            } else {
                state.addText(node.value as string);
            }
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('paragraph');
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly keymap = (nodeType: NodeType): Keymap => ({
        'Mod-Alt-0': setBlockType(nodeType),
    });
}
