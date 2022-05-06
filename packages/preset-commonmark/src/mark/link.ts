/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, createCmd, createCmdKey, schemaCtx, ThemeInputChipType } from '@milkdown/core';
import { toggleMark } from '@milkdown/prose/commands';
import { InputRule } from '@milkdown/prose/inputrules';
import { Node as ProseNode } from '@milkdown/prose/model';
import { Plugin, PluginKey, TextSelection } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { createMark } from '@milkdown/utils';

const key = new PluginKey('MILKDOWN_PLUGIN_LINK_INPUT');

export const ToggleLink = createCmdKey<string>('ToggleLink');
export const ModifyLink = createCmdKey<string>('ModifyLink');
const id = 'link';
export type LinkOptions = {
    input: {
        placeholder: string;
        buttonText?: string;
    };
};
export const link = createMark<string, LinkOptions>((utils, options) => {
    return {
        id,
        schema: () => ({
            attrs: {
                href: {},
                title: { default: null },
            },
            inclusive: false,
            parseDOM: [
                {
                    tag: 'a[href]',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return { href: dom.getAttribute('href'), title: dom.getAttribute('title') };
                    },
                },
            ],
            toDOM: (mark) => ['a', { ...mark.attrs, class: utils.getClassName(mark.attrs, id) }],
            parseMarkdown: {
                match: (node) => node.type === 'link',
                runner: (state, node, markType) => {
                    const url = node['url'] as string;
                    const title = node['title'] as string;
                    state.openMark(markType, { href: url, title });
                    state.next(node.children);
                    state.closeMark(markType);
                },
            },
            toMarkdown: {
                match: (mark) => mark.type.name === id,
                runner: (state, mark) => {
                    state.withMark(mark, 'link', undefined, {
                        title: mark.attrs['title'],
                        url: mark.attrs['href'],
                    });
                },
            },
        }),
        commands: (markType) => [
            createCmd(ToggleLink, (href = '') => toggleMark(markType, { href })),
            createCmd(ModifyLink, (href = '') => (state, dispatch) => {
                if (!dispatch) return false;

                const { marks } = state.schema;

                let node: ProseNode | undefined;
                let pos = -1;
                const { selection } = state;
                state.doc.nodesBetween(selection.from, selection.to, (n, p) => {
                    if (marks.link.isInSet(n.marks)) {
                        node = n;
                        pos = p;
                        return false;
                    }
                    return;
                });
                if (!node) return false;

                const mark = node.marks.find(({ type }) => type === markType);
                if (!mark) return false;

                const start = pos;
                const end = pos + node.nodeSize;
                const { tr } = state;
                const linkMark = marks.link.create({ ...mark.attrs, href });
                dispatch(
                    tr
                        .removeMark(start, end, mark)
                        .addMark(start, end, linkMark)
                        .setSelection(new TextSelection(tr.selection.$anchor))
                        .scrollIntoView(),
                );

                return true;
            }),
        ],
        inputRules: (markType, ctx) => [
            new InputRule(/\[(?<text>.*?)]\((?<href>.*?)(?=“|\))"?(?<title>[^"]+)?"?\)/, (state, match, start, end) => {
                const [okay, text = '', href, title] = match;
                const { tr } = state;
                if (okay) {
                    const content = text || 'link';
                    tr.replaceWith(start, end, ctx.get(schemaCtx).text(content)).addMark(
                        start,
                        content.length + start,
                        markType.create({ title, href }),
                    );
                }

                return tr;
            }),
        ],
        prosePlugins: (type, ctx) => {
            return [
                new Plugin({
                    key,
                    view: (editorView) => {
                        const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
                            placeholder: options?.input?.placeholder ?? 'Input Web Link',
                            buttonText: options?.input?.buttonText,
                            onUpdate: (value) => {
                                ctx.get(commandsCtx).call(ModifyLink, value);
                            },
                        });
                        if (!inputChipRenderer) return {};
                        const shouldDisplay = (view: EditorView) => {
                            const { selection, doc } = view.state;
                            const { from, to } = selection;

                            return (
                                view.hasFocus() &&
                                selection.empty &&
                                selection instanceof TextSelection &&
                                doc.rangeHasMark(from, from === to ? to + 1 : to, type)
                            );
                        };
                        const getCurrentLink = (view: EditorView) => {
                            const { selection } = view.state;
                            let node: ProseNode | undefined;
                            const { from, to } = selection;
                            view.state.doc.nodesBetween(from, from === to ? to + 1 : to, (n) => {
                                if (type.isInSet(n.marks)) {
                                    node = n;
                                    return false;
                                }
                                return;
                            });
                            if (!node) return;

                            const mark = node.marks.find((m) => m.type === type);
                            if (!mark) return;

                            const value = mark.attrs['href'];
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
