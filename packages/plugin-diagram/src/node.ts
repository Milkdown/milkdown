/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Node } from 'prosemirror-model';

import { getStyle } from './style';
import { getId } from './utility';

const inputRegex = /^```mermaid$/;

export type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
};

export const TurnIntoDiagram = createCmdKey();

export const diagramNode = createNode<string, Options>((options, utils) => {
    const { mermaidVariables, codeStyle, hideCodeStyle, previewPanelStyle } = getStyle(utils);
    const header = `%%{init: {'theme': 'base', 'themeVariables': { ${mermaidVariables()} }}}%%\n`;

    const id = 'diagram';
    mermaid.startOnLoad = false;
    mermaid.initialize({ startOnLoad: false });

    const placeholder = {
        empty: 'Empty',
        error: 'Syntax Error',
        ...(options?.placeholder ?? {}),
    };

    return {
        id,
        schema: {
            content: 'text*',
            group: 'block',
            marks: '',
            defining: true,
            code: true,
            attrs: {
                value: {
                    default: '',
                },
                identity: {
                    default: '',
                },
                editing: {
                    default: false,
                },
            },
            parseDOM: [
                {
                    tag: 'div[data-type="diagram"]',
                    preserveWhitespace: 'full',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            value: dom.innerHTML,
                            id: dom.id,
                        };
                    },
                },
            ],
            toDOM: (node) => {
                const id = getId(node);
                return [
                    'div',
                    {
                        id,
                        class: utils.getClassName(node.attrs, 'mermaid'),
                        'data-type': id,
                        'data-value': node.attrs.value,
                        'data-editing': node.attrs.editing.toString(),
                    },
                    0,
                ];
            },
        },
        parser: {
            match: ({ type }) => type === id,
            runner: (state, node, type) => {
                const value = node.value as string;
                state.openNode(type, { value });
                state.addText(value);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'mermaid' });
            },
        },
        commands: (nodeType) => [
            createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId(), editing: true })),
        ],
        view: (editor, nodeType, node, view, getPos, decorations) => {
            const currentId = getId(node);
            let currentNode = node;
            if (options?.view) {
                return options.view(editor, nodeType, node, view, getPos, decorations);
            }
            const dom = document.createElement('div');
            dom.classList.add('mermaid', 'diagram');
            const code = document.createElement('div');
            code.dataset.type = id;
            code.dataset.value = node.attrs.value;
            if (codeStyle) {
                code.classList.add(codeStyle);
            }

            const rendered = document.createElement('div');
            rendered.id = currentId;
            if (previewPanelStyle) {
                rendered.classList.add(previewPanelStyle);
            }

            dom.append(code);

            dom.dataset.editing = node.attrs.editing.toString();
            const updateEditing = (node: Node) => {
                if (!node.attrs.editing) {
                    code.classList.add(hideCodeStyle);
                    return;
                }

                code.classList.remove(hideCodeStyle);
            };

            const render = (node: Node) => {
                const code = header + node.attrs.value;
                try {
                    const svg = mermaid.render(currentId, code);
                    rendered.innerHTML = svg;
                } catch {
                    const error = document.getElementById('d' + currentId);
                    if (error) {
                        error.remove();
                    }
                    if (!node.attrs.value) {
                        rendered.innerHTML = placeholder.empty;
                    } else {
                        rendered.innerHTML = placeholder.error;
                    }
                } finally {
                    dom.appendChild(rendered);
                }
            };

            updateEditing(node);
            render(node);

            dom.addEventListener('mousedown', (e) => {
                if (currentNode.attrs.editing) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const { tr } = view.state;
                const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                    ...currentNode.attrs,
                    editing: true,
                });
                view.dispatch(_tr);
            });
            view.dom.addEventListener('mousedown', (e) => {
                if (!currentNode.attrs.editing) {
                    return;
                }
                const el = e.target;
                if (el === code || el === rendered) {
                    return;
                }
                const { tr } = view.state;
                const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                    ...currentNode.attrs,
                    editing: false,
                });
                view.dispatch(_tr);
            });

            return {
                dom,
                contentDOM: code,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;
                    currentNode = updatedNode;

                    updateEditing(updatedNode);

                    const newVal = updatedNode.content.firstChild?.text || '';

                    code.dataset.value = newVal;
                    dom.dataset.editing = updatedNode.attrs.editing.toString();
                    updatedNode.attrs.value = newVal;

                    render(updatedNode);

                    return true;
                },
                selectNode() {
                    if (!view.editable) return;
                },
                deselectNode() {
                    code.classList.add(hideCodeStyle);
                    const { tr } = view.state;
                    const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                        ...node.attrs,
                        editing: false,
                    });
                    view.dispatch(_tr);
                },
                destroy() {
                    rendered.remove();
                    code.remove();
                    dom.remove();
                },
            };
        },
        inputRules: (nodeType) => [
            textblockTypeInputRule(inputRegex, nodeType, () => ({ id: getId(), editing: true })),
        ],
    };
});
