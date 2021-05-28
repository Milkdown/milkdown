import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { Node, SerializerNode } from '@milkdown/core';

export class TabIndent extends Node {
    id = 'tab_indent';
    schema: NodeSpec = {
        group: 'inline',
        inline: true,
        selectable: false,
        parseDOM: [{ tag: `span[class='tab-indent']` }],
        toDOM: () => ['span', { class: 'tab-indent' }, '  '],
    };
    parser = {
        block: this.id,
    };
    serializer: SerializerNode = (state) => {
        state.write('  ');
    };
    override keymap = (nodeType: NodeType): Keymap => ({
        Tab: (state: EditorState, dispatch) => {
            const { selection } = state.tr;
            const result = Boolean(state.tr);

            if (!selection) return result;

            const { from, to } = selection;
            if (from !== to || !nodeType) return result;

            const tr = state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView();
            dispatch?.(tr);

            return Boolean(tr);
        },
    });
}
