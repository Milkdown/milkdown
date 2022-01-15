/* Copyright 2021, Milkdown by Mirone. */

import { createCmd, createCmdKey } from '@milkdown/core';
import { findSelectedNodeOfType, InputRule, NodeSelection } from '@milkdown/prose';
import { createNode } from '@milkdown/utils';
import katex from 'katex';

type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
};

export const ModifyInlineMath = createCmdKey<string>();
export const mathInline = createNode<string, Options>((utils, options) => {
    const placeholder = {
        empty: '(empty)',
        error: '(error)',
        ...(options?.placeholder ?? {}),
    };
    const style = utils.getStyle(({ size, palette }, { css }) => {
        return css`
            font-size: unset;

            &.ProseMirror-selectednode {
                outline: none;
                border: ${size.lineWidth} solid ${palette('line')};
            }
        `;
    });

    const id = 'math_inline';
    return {
        id,
        schema: () => ({
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                value: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `span[data-type="${id}"]`,
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            value: dom.dataset.value,
                        };
                    },
                },
            ],
            toDOM: (node) => ['span', { class: style, 'data-type': id, 'data-value': node.attrs.value }],
            parseMarkdown: {
                match: (node) => node.type === 'inlineMath',
                runner: (state, node, type) => {
                    const code = node.value as string;
                    state.addNode(type, { value: code });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('inlineMath', undefined, node.attrs.value);
                },
            },
        }),
        commands: (nodeType) => [
            createCmd(ModifyInlineMath, (value = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, nodeType);
                if (!node) return false;

                const { tr } = state;
                const _tr = tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, value });
                dispatch?.(_tr.setSelection(NodeSelection.create(_tr.doc, node.pos)));

                return true;
            }),
        ],
        view: () => (node) => {
            let currentNode = node;
            const dom = document.createElement('span');
            if (style) {
                dom.classList.add(style);
            }
            const render = (code: string) => {
                try {
                    if (!code) {
                        dom.innerHTML = placeholder.empty;
                    } else {
                        katex.render(code, dom);
                    }
                } catch {
                    dom.innerHTML = placeholder.error;
                }
            };
            render(node.attrs.value);
            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;

                    const newVal = updatedNode.attrs.value;

                    render(newVal);

                    return true;
                },
            };
        },
        inputRules: (nodeType) => [
            new InputRule(/\$(.+)\$/, (state, match, start, end) => {
                const $start = state.doc.resolve(start);
                const index = $start.index();
                const $end = state.doc.resolve(end);
                if (!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
                    return null;
                }
                const value = match[1];
                return state.tr.replaceRangeWith(
                    start,
                    end,
                    nodeType.create(
                        {
                            value,
                        },
                        nodeType.schema.text(value),
                    ),
                );
            }),
        ],
    };
});
