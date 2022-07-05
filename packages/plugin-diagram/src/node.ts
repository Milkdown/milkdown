/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, ThemeInnerEditorType, themeManagerCtx } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { setBlockType } from '@milkdown/prose/commands';
import { InputRule } from '@milkdown/prose/inputrules';
import { NodeSelection } from '@milkdown/prose/state';
import { NodeView } from '@milkdown/prose/view';
import { createNode } from '@milkdown/utils';
import mermaid from 'mermaid';
// eslint-disable-next-line import/no-unresolved
import mermaidAPI from 'mermaid/mermaidAPI';

import { remarkMermaid } from '.';
import { getStyle } from './style';
import { getId } from './utility';

const inputRegex = /^```mermaid$/;

export type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
    theme: mermaidAPI.Theme;
    themeCSS: string;
};

export const TurnIntoDiagram = createCmdKey('TurnIntoDiagram');

export const diagramNode = createNode<string, Options>((utils, options) => {
    const theme = options?.theme ?? undefined;
    const themeCSS = options?.themeCSS ?? undefined;

    const id = 'diagram';
    mermaid.startOnLoad = false;
    mermaid.initialize({ startOnLoad: false, theme, themeCSS });

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
                            throw expectDomTypeError(dom);
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
                        'data-value': node.attrs['value'] || node.textContent || '',
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
        view: (ctx) => (node, view, getPos) => {
            const currentId = getId(node);

            let header = '';
            let currentNode = node;

            ctx.get(themeManagerCtx).onFlush(() => {
                const mermaidVariables = getStyle(utils.themeManager);
                header = `%%{init: {'theme': 'base', 'themeVariables': { ${mermaidVariables} }}}%%\n`;
            });

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
                        renderer.dom.appendChild(renderer.preview);
                    }
                },
            });

            if (!renderer) return {} as NodeView;

            const { onUpdate, editor, dom, onFocus, onBlur, onDestroy, stopEvent } = renderer;
            editor.dataset['type'] = id;
            dom.classList.add('mermaid', 'diagram');

            onUpdate(currentNode, true);

            ctx.get(themeManagerCtx).onFlush(() => {
                onUpdate(currentNode, false);
            }, false);

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
                const tr = state.tr.delete(start, end).setBlockType(start, start, nodeType, { id: getId() });

                return tr.setSelection(NodeSelection.create(tr.doc, start - 1));
            }),
        ],
        remarkPlugins: () => [remarkMermaid],
    };
});
