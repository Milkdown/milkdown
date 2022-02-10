/* Copyright 2021, Milkdown by Mirone. */
import { textblockTypeInputRule } from '@milkdown/prose';
import { ThemeInnerEditorType } from '@milkdown/theme-pack-helper';
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
                            throw new Error();
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
                        class: utils.getClassName(node.attrs, 'mermaid'),
                        'data-type': id,
                        'data-value': node.attrs['value'],
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
            if (!renderer) return {};

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
        inputRules: (nodeType) => [textblockTypeInputRule(inputRegex, nodeType)],
    };
});
