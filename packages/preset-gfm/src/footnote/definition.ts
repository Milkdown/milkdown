/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, createCmd, createCmdKey, editorViewCtx, ThemeInputChipType } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { findSelectedNodeOfType } from '@milkdown/prose';
import { wrappingInputRule } from '@milkdown/prose/inputrules';
import { NodeSelection, Plugin, PluginKey } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { createNode } from '@milkdown/utils';

import { getFootnoteDefId, getFootnoteRefId } from './utils';

const key = new PluginKey('MILKDOWN_FOOTNOTE_DEF_INPUT');
export const ModifyFootnoteDef = createCmdKey<string>('ModifyFootnoteDef');

export const footnoteDefinition = createNode((utils) => {
    const id = 'footnote_definition';
    const markdownId = 'footnoteDefinition';

    return {
        id,
        schema: (ctx) => ({
            group: 'block',
            content: 'block+',
            defining: true,
            attrs: {
                label: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `div[data-type="${id}"]`,
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw expectDomTypeError(dom);
                        }
                        return {
                            label: dom.dataset['label'],
                        };
                    },
                    contentElement: 'dd',
                },
            ],
            toDOM: (node) => {
                const label = node.attrs['label'];
                const className = utils.getClassName(node.attrs, 'footnote-definition');

                const dt = document.createElement('dt');
                dt.textContent = `[${label}]:`;
                dt.onclick = () => {
                    const view = ctx.get(editorViewCtx);
                    const selection = NodeSelection.create(view.state.doc, view.state.selection.from - 2);
                    view.dispatch(view.state.tr.setSelection(selection));
                };

                const a = document.createElement('a');
                a.href = `#${getFootnoteRefId(label)}`;
                a.contentEditable = 'false';
                a.textContent = '↩';
                a.onmousedown = (e) => {
                    e.preventDefault();
                };

                return [
                    'div',
                    {
                        class: className,
                        'data-label': label,
                        'data-type': id,
                        id: getFootnoteDefId(label),
                    },
                    ['div', { class: 'footnote-definition_content' }, dt, ['dd', 0]],
                    ['div', { class: 'footnote-definition_anchor' }, a],
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === markdownId,
                runner: (state, node, type) => {
                    state
                        .openNode(type, {
                            label: node['label'] as string,
                        })
                        .next(node.children)
                        .closeNode();
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state
                        .openNode(markdownId, undefined, {
                            label: node.attrs['label'],
                            identifier: node.attrs['label'],
                        })
                        .next(node.content)
                        .closeNode();
                },
            },
        }),
        commands: (nodeType) => [
            createCmd(ModifyFootnoteDef, (label = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, nodeType);
                if (!node) return false;

                const { tr } = state;
                const _tr = tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, label });
                dispatch?.(_tr.setSelection(NodeSelection.create(_tr.doc, node.pos)));

                return true;
            }),
        ],
        inputRules: (nodeType) => [
            wrappingInputRule(
                /(?:\[\^)([^:]+)(?::)$/,
                nodeType,
                (match) => {
                    const label = match[1] ?? 'footnote';
                    return {
                        label,
                    };
                },
                () => false,
            ),
        ],
        prosePlugins: (type, ctx) => {
            return [
                new Plugin({
                    key,
                    view: (editorView) => {
                        const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
                            width: '12em',
                            placeholder: 'Input Footnote Label',
                            onUpdate: (value) => {
                                ctx.get(commandsCtx).call(ModifyFootnoteDef, value);
                            },
                            isBindMode: true,
                        });
                        if (!inputChipRenderer) return {};
                        const shouldDisplay = (view: EditorView) =>
                            Boolean(type && findSelectedNodeOfType(view.state.selection, type));
                        const getCurrentLabel = (view: EditorView) => {
                            const result = findSelectedNodeOfType(view.state.selection, type);
                            if (!result) return;

                            const value = result.node.attrs['label'];
                            return value;
                        };
                        const renderByView = (view: EditorView) => {
                            if (!view.editable) {
                                return;
                            }
                            const display = shouldDisplay(view);
                            if (display) {
                                inputChipRenderer.show(view);
                                inputChipRenderer.update(getCurrentLabel(view));
                            } else {
                                inputChipRenderer.hide();
                            }
                        };
                        inputChipRenderer.init(editorView);
                        renderByView(editorView);

                        return {
                            update: (view, prevState) => {
                                const isEqualSelection =
                                    prevState?.doc.eq(view.state.doc) && prevState.selection.eq(view.state.selection);
                                if (isEqualSelection) return;

                                renderByView(view);
                            },
                            destroy: () => {
                                inputChipRenderer.destroy();
                            },
                        };
                    },
                }),
            ];
        },
    };
});
