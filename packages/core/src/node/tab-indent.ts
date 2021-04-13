import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { Fragment } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

import { Node } from '../abstract';
import { SerializerNode } from '../serializer/types';

export class TabIndent extends Node {
    name = 'tab_indent';
    schema: NodeSpec = {
        group: 'inline',
        inline: true,
        selectable: false,
        parseDOM: [{ tag: `span[class='tab-indent']` }],
        toDOM: () => ['span', { class: 'tab-indent' }, '  '],
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state) => {
        state.write('  ');
    };
    keymap = (nodeType: NodeType): Keymap => ({
        Tab: (state: EditorState, dispatch) => {
            const { selection } = state.tr;
            const result = Boolean(state.tr);

            if (!selection) return result;

            const { from, to } = selection;
            if (from !== to || !nodeType) return result;

            const node = nodeType.create();
            const frag = Fragment.from([node]);
            const tr = state.tr.insert(from, frag);
            dispatch?.(tr);

            return Boolean(tr);
        },
    });
}
