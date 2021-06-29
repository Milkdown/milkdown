import type { Keymap } from 'prosemirror-commands';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { CommonNode } from '../utility';

export class HardBreak extends CommonNode {
    override readonly id = 'hardbreak';
    override readonly schema: NodeSpec = {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: (node) => ['br', { class: this.getClassName(node.attrs) }] as const,
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'break',
        runner: (type, state) => {
            state.addNode(type);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (_, state) => {
            state.addNode('break');
        },
    };
    override readonly keymap = (nodeType: NodeType): Keymap => ({
        'Shift-Enter': (state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView());
            return true;
        },
    });
}
