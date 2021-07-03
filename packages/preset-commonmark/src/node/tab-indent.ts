import type { NodeSpec, NodeType } from 'prosemirror-model';
import type { Keymap } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { CommonNode } from '../utility/base';

export class TabIndent extends CommonNode {
    override readonly id = 'tab_indent';
    override readonly schema: NodeSpec = {
        group: 'inline',
        inline: true,
        selectable: false,
        parseDOM: [{ tag: `span[class='tab-indent']` }],
        toDOM: (node) => ['span', { class: this.getClassName(node.attrs, 'tab-indent') }, '  '],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type }) => type === 'tab',
        runner: (state, _, type) => {
            state.addNode(type);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state) => {
            state.addNode('tab');
        },
    };
    override readonly keymap = (nodeType: NodeType): Keymap => ({
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
