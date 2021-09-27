/* Copyright 2021, Milkdown by Mirone. */

import { css } from '@emotion/css';
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode, findSelectedNodeOfType } from '@milkdown/utils';
import katex from 'katex';
import { InputRule } from 'prosemirror-inputrules';

export const ModifyInlineMath = createCmdKey<string>();
export const mathInline = createNode((_, utils) => {
    const style = utils.getStyle(({ size, palette }) => {
        return css`
            font-size: 0.875rem;

            &.ProseMirror-selectednode {
                outline: none;
                border: ${size.lineWidth} solid ${palette('line')};
            }
        `;
    });

    const id = 'math_inline';
    return {
        id,
        schema: {
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                value: {
                    default: '',
                },
            },
            parseDOM: [{ tag: 'span[data-type="mathInline"]' }],
            toDOM: () => ['span', { class: style, 'data-type': id }, 0],
        },
        parser: {
            match: (node) => node.type === 'inlineMath',
            runner: (state, node, type) => {
                const code = node.value as string;
                state.addNode(type, { value: code });
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                let text = '';
                node.forEach((n) => {
                    text += n.text as string;
                });
                state.addNode('inlineMath', undefined, text);
            },
        },
        commands: (nodeType) => [
            createCmd(ModifyInlineMath, (value = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, nodeType);
                if (!node) return false;

                const { tr } = state;
                dispatch?.(tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, value }).scrollIntoView());

                return true;
            }),
        ],
        view: (_editor, _nodeType, node) => {
            let currentNode = node;
            const dom = document.createElement('span');
            if (style) {
                dom.classList.add(style);
            }
            const render = (code: string) => {
                try {
                    // const code = node.attrs.value;
                    if (!code) {
                        dom.innerHTML = '(empty)';
                        // rendered.innerHTML = placeholder.empty;
                    } else {
                        katex.render(code, dom);
                    }
                } catch {
                    dom.innerHTML = '(error)';
                    // rendered.innerHTML = placeholder.error;
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
                return state.tr.replaceRangeWith(
                    start,
                    end,
                    nodeType.create(
                        {
                            value: match[1],
                        },
                        nodeType.schema.text(match[1]),
                    ),
                );
            }),
        ],
    };
});
