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
        parseDOM: [{ tag: `span[class='tab-indent']` }],
        toDOM: () => ['span', { class: 'tab-indent', style: 'letter-spacing: 20px; display: inline-block' }, ' '],
    };
    parser = {
        block: this.name,
    };
    serializer: SerializerNode = (state, node) => {
        state.renderInline(node).closeBlock(node);
    };
    inputRules = () => [];
    keymap = (nodeType: NodeType): Keymap => ({
        Tab: (state: EditorState, dispatch) => {
            const { selection } = state.tr;
            if (!selection) return !!state.tr;
            const { from, to } = selection;
            if (from !== to) return !!state.tr;
            if (!nodeType) return !!state.tr;
            const node = nodeType.create({});
            const frag = Fragment.from([node]);
            const _tr = state.tr.insert(from, frag);
            if (dispatch) {
                dispatch(_tr);
            }
            return !!_tr;
        },
    });
}
