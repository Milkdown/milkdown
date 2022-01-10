/* Copyright 2021, Milkdown by Mirone. */
import { textblockTypeInputRule } from '@milkdown/prose';
import { createNode } from '@milkdown/utils';
import katex from 'katex';

import { createInnerEditor } from './inner-editor';
import { getStyle } from './style';

const inputRegex = /^\$\$\s$/;

type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
};

export const mathBlock = createNode<string, Options>((utils, options) => {
    const { codeStyle, hideCodeStyle, previewPanelStyle } = getStyle(utils);
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
                            value: dom.dataset.value,
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
                        'data-value': node.attrs.value,
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'math',
                runner: (state, node, type) => {
                    const value = node.value as string;
                    state.openNode(type, { value });
                    state.addText(value);
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
            const innerEditor = createInnerEditor(view, getPos);

            let currentNode = node;
            const dom = document.createElement('div');
            dom.classList.add('math-block');
            const code = document.createElement('div');
            code.dataset.type = id;
            code.dataset.value = node.attrs.value;
            if (codeStyle) {
                code.classList.add(codeStyle, hideCodeStyle);
            }

            const rendered = document.createElement('div');
            if (previewPanelStyle) {
                rendered.classList.add(previewPanelStyle);
            }

            dom.append(code);

            const render = (code: string) => {
                try {
                    if (!code) {
                        rendered.innerHTML = placeholder.empty;
                    } else {
                        katex.render(code, rendered);
                    }
                } catch {
                    rendered.innerHTML = placeholder.error;
                } finally {
                    dom.appendChild(rendered);
                }
            };

            render(node.attrs.value);

            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;

                    const innerView = innerEditor.innerView();
                    if (innerView) {
                        const state = innerView.state;
                        const start = updatedNode.content.findDiffStart(state.doc.content);
                        if (start !== null && start !== undefined) {
                            const diff = updatedNode.content.findDiffEnd(state.doc.content);
                            if (diff) {
                                let { a: endA, b: endB } = diff;
                                const overlap = start - Math.min(endA, endB);
                                if (overlap > 0) {
                                    endA += overlap;
                                    endB += overlap;
                                }
                                innerView.dispatch(
                                    state.tr.replace(start, endB, node.slice(start, endA)).setMeta('fromOutside', true),
                                );
                            }
                        }
                    }

                    const newVal = updatedNode.content.firstChild?.text || '';
                    code.dataset.value = newVal;

                    render(newVal);

                    return true;
                },
                selectNode: () => {
                    if (!view.editable) return;
                    code.classList.remove(hideCodeStyle);
                    innerEditor.openEditor(code, currentNode);
                    dom.classList.add('ProseMirror-selectednode');
                },
                deselectNode: () => {
                    code.classList.add(hideCodeStyle);
                    innerEditor.closeEditor();
                    dom.classList.remove('ProseMirror-selectednode');
                },
                stopEvent: (event) => {
                    const innerView = innerEditor.innerView();
                    const { target } = event;
                    const isChild = target && innerView?.dom.contains(target as Element);
                    return !!(innerView && isChild);
                },
                ignoreMutation: () => true,
                destroy() {
                    rendered.remove();
                    code.remove();
                    dom.remove();
                },
            };
        },
        inputRules: (nodeType) => [textblockTypeInputRule(inputRegex, nodeType)],
    };
});
