/* Copyright 2021, Milkdown by Mirone. */

import { commandsCtx, createCmd, createCmdKey, editorViewCtx, ThemeInputChipType } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { findSelectedNodeOfType } from '@milkdown/prose';
import { InputRule } from '@milkdown/prose/inputrules';
import { NodeSelection, Plugin, PluginKey } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { createNode } from '@milkdown/utils';

import { getFootnoteDefId, getFootnoteRefId } from './utils';

export const ModifyFootnoteRef = createCmdKey<string>('ModifyFootnoteRef');
const key = new PluginKey('MILKDOWN_FOOTNOTE_REF_INPUT');

export const footnoteReference = createNode((utils) => {
    const id = 'footnote_reference';

    return {
        id,
        schema: (ctx) => ({
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                label: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `sup[data-type="${id}"]`,
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw expectDomTypeError(dom);
                        }
                        return {
                            label: dom.dataset['label'],
                        };
                    },
                },
            ],
            toDOM: (node) => {
                const label = node.attrs['label'];
                const a = document.createElement('a');
                const href = `#${getFootnoteDefId(label)}`;
                a.href = href;
                a.textContent = `[${label}]`;
                a.onclick = (e) => {
                    const view = ctx.get(editorViewCtx);
                    if (view.editable) {
                        e.preventDefault();
                    }
                };
                a.ondblclick = () => {
                    const view = ctx.get(editorViewCtx);
                    if (view.editable) {
                        window.location.href = href;
                    }
                };
                return [
                    'sup',
                    {
                        'data-label': label,
                        'data-type': id,
                        id: getFootnoteRefId(label),
                    },
                    a,
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === 'footnoteReference',
                runner: (state, node, type) => {
                    state.addNode(type, {
                        label: node['label'] as string,
                    });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('footnoteReference', undefined, undefined, {
                        label: node.attrs['label'],
                        identifier: node.attrs['label'],
                    });
                },
            },
        }),
        commands: (nodeType) => [
            createCmd(ModifyFootnoteRef, (label = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, nodeType);
                if (!node) return false;

                const { tr } = state;
                const _tr = tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, label });
                dispatch?.(_tr.setSelection(NodeSelection.create(_tr.doc, node.pos)));

                return true;
            }),
        ],
        inputRules: (nodeType) => [
            new InputRule(/(?:\[\^)([^\]]+)(?:\])$/, (state, match, start, end) => {
                const $start = state.doc.resolve(start);
                const index = $start.index();
                const $end = state.doc.resolve(end);
                if (!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
                    return null;
                }
                const label = match[1];
                return state.tr.replaceRangeWith(
                    start,
                    end,
                    nodeType.create({
                        label,
                    }),
                );
            }),
        ],
        prosePlugins: (type, ctx) => {
            const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
                width: '12em',
                placeholder: 'Input Footnote Label',
                onUpdate: (value) => {
                    ctx.get(commandsCtx).call(ModifyFootnoteRef, value);
                },
                isBindMode: true,
            });
            if (!inputChipRenderer) return [];
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
            return [
                new Plugin({
                    key,
                    view: (editorView) => {
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
