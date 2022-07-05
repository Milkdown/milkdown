/* Copyright 2021, Milkdown by Mirone. */
import type { ThemeInnerEditorType } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { InputRule } from '@milkdown/prose/inputrules';
import { NodeSelection } from '@milkdown/prose/state';
import { NodeView } from '@milkdown/prose/view';
import { createNode } from '@milkdown/utils';
import katex from 'katex';

const inputRegex = /^\$\$\s$/;

type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
};

export const mathBlock = createNode<string, Options>((utils, options) => {
    const id = 'math_block';
    const placeholder = {
        empty: 'Empty',
        error: 'Syntax Error',
        ...(options?.placeholder ?? {}),
    };

    return {
        id,
        schema: () => ({
            content: 'text*',
            group: 'block',
            marks: '',
            defining: true,
            atom: true,
            code: true,
            isolating: true,
            attrs: {
                value: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `div[data-type="${id}"]`,
                    preserveWhitespace: 'full',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw expectDomTypeError(dom);
                        }
                        return {
                            value: dom.dataset['value'],
                        };
                    },
                },
            ],
            toDOM: (node) => {
                return [
                    'div',
                    {
                        class: utils.getClassName(node.attrs, 'math-block'),
                        'data-type': id,
                        'data-value': node.attrs['value'] || node.textContent || '',
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'math',
                runner: (state, node, type) => {
                    const value = node['value'] as string;
                    state.openNode(type, { value });
                    if (value) {
                        state.addText(value);
                    }
                    state.closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    let text = '';
                    node.forEach((n) => {
                        text += n.text as string;
                    });
                    state.addNode('math', undefined, text);
                },
            },
        }),
        view: () => (node, view, getPos) => {
            let currentNode = node;
            const renderer = utils.themeManager.get<ThemeInnerEditorType>('inner-editor', {
                view,
                getPos,
                render: (code) => {
                    try {
                        if (!code) {
                            renderer.preview.innerHTML = placeholder.empty;
                        } else {
                            katex.render(code, renderer.preview);
                        }
                    } catch {
                        renderer.preview.innerHTML = placeholder.error;
                    } finally {
                        dom.appendChild(renderer.preview);
                    }
                },
            });
            if (!renderer) return {} as NodeView;

            const { onUpdate, editor, dom, onFocus, onBlur, onDestroy, stopEvent } = renderer;
            dom.classList.add('math-block');

            editor.dataset['type'] = id;

            onUpdate(currentNode, true);

            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;
                    onUpdate(currentNode, false);

                    return true;
                },
                selectNode: () => {
                    onFocus(currentNode);
                },
                deselectNode: () => {
                    onBlur(currentNode);
                },
                stopEvent,
                ignoreMutation: () => true,
                destroy() {
                    onDestroy();
                },
            };
        },
        inputRules: (nodeType) => [
            new InputRule(inputRegex, (state, _match, start, end) => {
                const $start = state.doc.resolve(start);
                if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;
                const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType);

                return tr.setSelection(NodeSelection.create(tr.doc, start - 1));
            }),
        ],
    };
});
