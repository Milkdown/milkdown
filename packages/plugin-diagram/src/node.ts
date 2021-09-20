/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';
import { setBlockType } from 'prosemirror-commands';
import { textblockTypeInputRule } from 'prosemirror-inputrules';
import { Node } from 'prosemirror-model';

import { createInnerEditor } from './inner-editor';
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
            atom: true,
            code: true,
            isolating: true,
            attrs: {
                value: {
                    default: '',
                },
                identity: {
                    default: '',
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
        commands: (nodeType) => [createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId() }))],
        view: (_editor, nodeType, node, view, getPos) => {
            nodeType;
            view;
            getPos;

            const innerEditor = createInnerEditor();

            const currentId = getId(node);
            let currentNode = node;
            const dom = document.createElement('div');
            dom.classList.add('mermaid', 'diagram');
            const code = document.createElement('div');
            code.dataset.type = id;
            code.dataset.value = node.attrs.value;
            if (codeStyle) {
                code.classList.add(codeStyle, hideCodeStyle);
            }

            const rendered = document.createElement('div');
            rendered.id = currentId;
            if (previewPanelStyle) {
                rendered.classList.add(previewPanelStyle);
            }

            dom.append(code);

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

            render(node);

            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;

                    const newVal = updatedNode.content.firstChild?.text || '';

                    code.dataset.value = newVal;
                    updatedNode.attrs.value = newVal;

                    render(updatedNode);

                    return true;
                },
                selectNode: () => {
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
        inputRules: (nodeType) => [textblockTypeInputRule(inputRegex, nodeType, () => ({ id: getId() }))],
    };
});
