import type { NodeSpec, NodeType } from 'prosemirror-model';
import { SerializerNode } from '@milkdown/core';
import { wrappingInputRule } from 'prosemirror-inputrules';
import { CommonMarkNode } from '../utility/base';

export class OrderedList extends CommonMarkNode {
    override readonly id = 'ordered_list';
    override readonly schema: NodeSpec = {
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
    override readonly parser = {
        block: this.id,
    };
    override readonly serializer: SerializerNode = (state, node) => {
        const { order = 1 } = node.attrs;
        const maxWidth = `${order + node.childCount - 1}`.length;
        const space = state.utils.repeat(' ', maxWidth + 2);
        state.renderList(node, space, (i) => {
            const n = `${order + i}`;
            return state.utils.repeat(' ', maxWidth - n.length) + n + '. ';
        });
    };
    override readonly inputRules = (nodeType: NodeType) => [
        wrappingInputRule(
            /^(\d+)\.\s$/,
            nodeType,
            (match) => ({ order: Number(match[1]) }),
            (match, node) => node.childCount + node.attrs.order === Number(match[1]),
        ),
    ];
}
