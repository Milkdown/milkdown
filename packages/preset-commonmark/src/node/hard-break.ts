import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '@milkdown/utils';

type Keys = SupportedKeys['HardBreak'];

export class HardBreak extends BaseNode<Keys> {
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
        runner: (state, _, type) => {
            state.addNode(type);
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state) => {
            state.addNode('break');
        },
    };
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.HardBreak]: {
            defaultKey: 'Shift-Enter',
            command: (state, dispatch) => {
                dispatch?.(state.tr.replaceSelectionWith(nodeType.create()).scrollIntoView());
                return true;
            },
        },
    });
}
