import type { Keymap } from 'prosemirror-commands';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode } from '@milkdown/core';
import { CommonMarkNode } from '../utility';

export class HardBreak extends CommonMarkNode {
    override readonly id = 'hardbreak';
    override readonly schema: NodeSpec = {
        inline: true,
        group: 'inline',
        selectable: false,
        parseDOM: [{ tag: 'br' }],
        toDOM: (node) => ['br', { class: this.getClassName(node.attrs) }] as const,
    };
    override readonly parser = {
        block: this.id,
        isAtom: true,
    };
    override readonly serializer: SerializerNode = (state) => {
        state.write('  \n');
    };
    override readonly keymap = (nodeType: NodeType): Keymap => ({
        'Shift-Enter': (state, dispatch) => {
            dispatch?.(state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView());
            return true;
        },
    });
}
