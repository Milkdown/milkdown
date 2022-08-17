/* Copyright 2021, Milkdown by Mirone. */

import { Color, commandsCtx, createCmd, createCmdKey, ThemeColor, ThemeInputChipType, ThemeSize } from '@milkdown/core';
import { expectDomTypeError } from '@milkdown/exception';
import { findSelectedNodeOfType } from '@milkdown/prose';
import { InputRule } from '@milkdown/prose/inputrules';
import { NodeSelection, Plugin, PluginKey } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { createNode } from '@milkdown/utils';
import katex, { KatexOptions } from 'katex';

type Options = {
    placeholder: {
        empty: string;
        error: string;
    };
    input: {
        placeholder: string;
    };
    katexOptions: KatexOptions;
};

const key = new PluginKey('MILKDOWN_MATH_INPUT');

export const ModifyInlineMath = createCmdKey<string>('ModifyInlineMath');
export const mathInline = createNode<string, Options>((utils, options) => {
    const placeholder = {
        empty: '(empty)',
        error: '(error)',
        ...(options?.placeholder ?? {}),
    };
    const inputPlaceholder = options?.input?.placeholder ?? 'Input Math';
    const katexOptions: KatexOptions = {
        ...(options?.katexOptions ?? {}),
    };
    const themeManager = utils.themeManager;
    const getStyle = () =>
        utils.getStyle(({ css }) => {
            const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
            const lineWidth = themeManager.get(ThemeSize, 'lineWidth');
            return css`
                font-size: unset;

                &.ProseMirror-selectednode {
                    outline: none;
                    border: ${lineWidth} solid ${palette('line')};
                }
            `;
        });

    const id = 'math_inline';
    return {
        id,
        schema: () => ({
            group: 'inline',
            inline: true,
            atom: true,
            attrs: {
                value: {
                    default: '',
                },
            },
            parseDOM: [
                {
                    tag: `span[data-type="${id}"]`,
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
                const span = document.createElement('span');
                span.dataset['type'] = id;
                span.dataset['value'] = node.attrs['value'];
                utils.themeManager.onFlush(() => {
                    const style = getStyle();
                    if (style) {
                        span.className = style;
                    }
                });
                return span;
            },
            parseMarkdown: {
                match: (node) => node.type === 'inlineMath',
                runner: (state, node, type) => {
                    const code = node['value'] as string;
                    state.addNode(type, { value: code });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('inlineMath', undefined, node.attrs['value']);
                },
            },
        }),
        commands: (nodeType) => [
            createCmd(ModifyInlineMath, (value = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, nodeType);
                if (!node) return false;

                const { tr } = state;
                const _tr = tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, value });
                dispatch?.(_tr.setSelection(NodeSelection.create(_tr.doc, node.pos)));

                return true;
            }),
        ],
        view: () => (node) => {
            let currentNode = node;
            const dom = document.createElement('span');
            utils.themeManager.onFlush(() => {
                const style = getStyle();

                if (style) {
                    dom.className = style;
                }
            });
            const render = (code: string) => {
                try {
                    if (!code) {
                        dom.innerHTML = placeholder.empty;
                    } else {
                        katex.render(code, dom, katexOptions);
                    }
                } catch (e) {
                    if (e instanceof Error) {
                        console.warn(e.message);
                    }
                    dom.innerHTML = placeholder.error;
                }
            };
            render(node.attrs['value']);
            return {
                dom,
                update: (updatedNode) => {
                    if (!updatedNode.sameMarkup(currentNode)) return false;
                    currentNode = updatedNode;

                    const newVal = updatedNode.attrs['value'];

                    render(newVal);

                    return true;
                },
            };
        },
        inputRules: (nodeType) => [
            new InputRule(/(?:\$)([^$]+)(?:\$)$/, (state, match, start, end) => {
                const $start = state.doc.resolve(start);
                const index = $start.index();
                const $end = state.doc.resolve(end);
                if (!$start.parent.canReplaceWith(index, $end.index(), nodeType)) {
                    return null;
                }
                const value = match[1] ?? '';
                return state.tr.replaceRangeWith(
                    start,
                    end,
                    nodeType.create(
                        {
                            value,
                        },
                        nodeType.schema.text(value),
                    ),
                );
            }),
        ],
        prosePlugins: (type, ctx) => {
            return [
                new Plugin({
                    key,
                    view: (editorView) => {
                        const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
                            placeholder: inputPlaceholder,
                            onUpdate: (value) => {
                                ctx.get(commandsCtx).call(ModifyInlineMath, value);
                            },
                            isBindMode: true,
                        });
                        if (!inputChipRenderer) return {};
                        const shouldDisplay = (view: EditorView) => {
                            return Boolean(type && findSelectedNodeOfType(view.state.selection, type));
                        };
                        const getCurrentLink = (view: EditorView) => {
                            const result = findSelectedNodeOfType(view.state.selection, type);
                            if (!result) return;

                            const value = result.node.attrs['value'];
                            return value;
                        };
                        const renderByView = (view: EditorView) => {
                            if (!view.editable) {
                                return;
                            }
                            const display = shouldDisplay(view);
                            if (display) {
                                inputChipRenderer.show(view);
                                inputChipRenderer.update(getCurrentLink(view));
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
