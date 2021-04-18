import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode, Node } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';

export class OrderedList extends Node {
    id = 'ordered_list';
    schema: NodeSpec = {
        content: 'list_item+',
        group: 'block',
        attrs: {
            order: {
                default: 1,
            },
        },
        parseDOM: [
            {
                tag: 'ol',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getAttrs: (dom: any) => ({ order: dom.hasAttribute('start') ? Number(dom.getAttribute('start')) : 1 }),
            },
        ],
        toDOM: (node) => ['ol', { ...(node.attrs.order === 1 ? {} : node.attrs.order), class: 'ordered-list' }, 0],
    };
    parser = {
        block: this.id,
    };
    serializer: SerializerNode = (state, node) => {
        const { order = 1 } = node.attrs;
        const maxWidth = `${order + node.childCount - 1}`.length;
        const space = state.utils.repeat(' ', maxWidth + 2);
        state.renderList(node, space, (i) => {
            const n = `${order + i}`;
            return state.utils.repeat(' ', maxWidth - n.length) + n + '. ';
        });
    };
    inputRules = (nodeType: NodeType) => [
        wrappingInputRule(
            /^(\d+)\.\s$/,
            nodeType,
            (match) => ({ order: Number(match[1]) }),
            (match, node) => node.childCount + node.attrs.order === Number(match[1]),
        ),
    ];
}
