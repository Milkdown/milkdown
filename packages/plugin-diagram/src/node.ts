/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey } from '@milkdown/core';
import { setBlockType, textblockTypeInputRule } from '@milkdown/prose';
import { ThemeInnerEditorType } from '@milkdown/theme-pack-helper';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';

import { remarkMermaid } from '.';
import { getStyle } from './style';
import { getId } from './utility';

const inputRegex = /^```mermaid$/;

export type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
};

export const TurnIntoDiagram = createCmdKey('TurnIntoDiagram');

export const diagramNode = createNode<string, Options>((utils, options) => {
    const mermaidVariables = getStyle(utils.themeManager);
    const header = `%%{init: {'theme': 'base', 'themeVariables': { ${mermaidVariables} }}}%%\n`;

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
                identity: {
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
                            identity: dom.id,
                        };
                    },
                },
            ],
            toDOM: (node) => {
                const identity = getId(node);
                return [
                    'div',
                    {
                        id: identity,
                        class: utils.getClassName(node.attrs, 'mermaid'),
                        'data-type': id,
                        'data-value': node.attrs['value'],
                    },
                    0,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
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
                    state.addNode('code', undefined, node.content.firstChild?.text || '', { lang: 'mermaid' });
                },
            },
        }),
        commands: (nodeType) => [createCmd(TurnIntoDiagram, () => setBlockType(nodeType, { id: getId() }))],
        view: () => (node, view, getPos) => {
            const currentId = getId(node);
            let currentNode = node;
            const renderer = utils.themeManager.get<ThemeInnerEditorType>('inner-editor', {
                view,
                getPos,
                render: (code) => {
                    try {
                        if (!code) {
                            renderer.preview.innerHTML = placeholder.empty;
                        } else {
                            renderer.preview.innerHTML = mermaid.render(currentId, header + code);
                        }
                    } catch {
                        const error = document.getElementById('d' + currentId);
                        if (error) {
                            error.remove();
                        }
                        renderer.preview.innerHTML = placeholder.error;
                    } finally {
                        dom.appendChild(renderer.preview);
                    }
                },
            });
            if (!renderer) return {};

            const { onUpdate, editor, dom, onFocus, onBlur, onDestroy, stopEvent } = renderer;
            editor.dataset['type'] = id;
            dom.classList.add('mermaid', 'diagram');

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
        inputRules: (nodeType) => [textblockTypeInputRule(inputRegex, nodeType, () => ({ id: getId() }))],
        remarkPlugins: () => [remarkMermaid],
    };
});
