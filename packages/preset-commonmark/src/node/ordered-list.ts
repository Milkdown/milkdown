import type { NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { wrapIn } from 'prosemirror-commands';
import { wrappingInputRule } from 'prosemirror-inputrules';
import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SupportedKeys } from '../supported-keys';
import { BaseNode } from '@milkdown/utils';

type Keys = SupportedKeys.OrderedList;

export class OrderedList extends BaseNode<Keys> {
    override readonly id = 'ordered_list';
    override readonly schema: NodeSpec = {
        content: 'listItem+',
        group: 'block',
        attrs: {
            order: {
                default: 1,
            },
        },
        parseDOM: [
            {
                tag: 'ol',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) {
                        throw new Error();
                    }
                    return { order: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) : 1 };
                },
            },
        ],
        toDOM: (node) => [
            'ol',
            {
                ...(node.attrs.order === 1 ? {} : node.attrs.order),
                class: this.getClassName(node.attrs, 'ordered-list'),
            },
            0,
        ],
    };
    override readonly parser: NodeParserSpec = {
        match: ({ type, ordered }) => type === 'list' && !!ordered,
        runner: (state, node, type) => {
            state.openNode(type);
            state.next(node.children);
            state.closeNode();
        },
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('list', undefined, { ordered: true, start: 1 });
            state.next(node.content);
            state.closeNode();
        },
    };
    override readonly inputRules = (nodeType: NodeType) => [
        wrappingInputRule(
            /^(\d+)\.\s$/,
            nodeType,
            (match) => ({ order: Number(match[1]) }),
            (match, node) => node.childCount + node.attrs.order === Number(match[1]),
        ),
    ];
    override readonly commands: BaseNode<Keys>['commands'] = (nodeType: NodeType) => ({
        [SupportedKeys.OrderedList]: {
            defaultKey: 'Mod-Shift-7',
            command: wrapIn(nodeType),
        },
    });
}
