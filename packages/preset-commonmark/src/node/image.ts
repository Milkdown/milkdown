/* Copyright 2021, Milkdown by Mirone. */
import { commandsCtx, createCmd, createCmdKey, ThemeImageType, ThemeInputChipType } from '@milkdown/core';
import { EditorView, findSelectedNodeOfType, InputRule, Plugin, PluginKey } from '@milkdown/prose';
import { createNode } from '@milkdown/utils';

export const ModifyImage = createCmdKey<string>('ModifyImage');
export const InsertImage = createCmdKey<string>('InsertImage');
const id = 'image';
export type ImageOptions = {
    isBlock: boolean;
    placeholder: {
        loading: string;
        empty: string;
        failed: string;
    };
    input: {
        placeholder: string;
        buttonText?: string;
    };
};
const key = new PluginKey('MILKDOWN_PLUGIN_IMAGE_INPUT');

export const image = createNode<string, ImageOptions>((utils, options) => {
    return {
        id: 'image',
        schema: () => ({
            inline: true,
            group: 'inline',
            selectable: true,
            draggable: true,
            marks: '',
            atom: true,
            defining: true,
            isolating: true,
            attrs: {
                src: { default: '' },
                alt: { default: null },
                title: { default: null },
                failed: { default: false },
                loading: { default: true },
                width: { default: null },
            },
            parseDOM: [
                {
                    tag: 'img[src]',
                    getAttrs: (dom) => {
                        if (!(dom instanceof HTMLElement)) {
                            throw new Error();
                        }
                        return {
                            failed: dom.classList.contains('failed'),
                            loading: dom.classList.contains('loading'),
                            src: dom.getAttribute('src') || '',
                            alt: dom.getAttribute('alt'),
                            title: dom.getAttribute('title') || dom.getAttribute('alt'),
                            width: dom.getAttribute('width'),
                        };
                    },
                },
            ],
            toDOM: (node) => {
                return [
                    'img',
                    {
                        ...node.attrs,
                        class: utils.getClassName(
                            node.attrs,
                            id,
                            node.attrs['failed'] ? 'failed' : '',
                            node.attrs['loading'] ? 'loading' : '',
                        ),
                    },
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    const url = node['url'] as string;
                    const alt = node['alt'] as string;
                    const title = node['title'] as string;
                    state.addNode(type, {
                        src: url,
                        alt,
                        title,
                    });
                },
            },
            toMarkdown: {
                match: (node) => node.type.name === id,
                runner: (state, node) => {
                    state.addNode('image', undefined, undefined, {
                        title: node.attrs['title'],
                        url: node.attrs['src'],
                        alt: node.attrs['alt'],
                    });
                },
            },
        }),
        commands: (type) => [
            createCmd(InsertImage, (src = '') => (state, dispatch) => {
                if (!dispatch) return true;
                const { tr } = state;
                const node = type.create({ src });
                if (!node) {
                    return true;
                }
                const _tr = tr.replaceSelectionWith(node);
                dispatch(_tr.scrollIntoView());
                return true;
            }),
            createCmd(ModifyImage, (src = '') => (state, dispatch) => {
                const node = findSelectedNodeOfType(state.selection, type);
                if (!node) return false;

                const { tr } = state;
                dispatch?.(
                    tr.setNodeMarkup(node.pos, undefined, { ...node.node.attrs, loading: true, src }).scrollIntoView(),
                );

                return true;
            }),
        ],
        inputRules: (type) => [
            new InputRule(
                /!\[(?<alt>.*?)]\((?<filename>.*?)\s*(?="|\))"?(?<title>[^"]+)?"?\)/,
                (state, match, start, end) => {
                    const [okay, alt, src = '', title] = match;
                    const { tr } = state;
                    if (okay) {
                        tr.replaceWith(start, end, type.create({ src, alt, title }));
                    }

                    return tr;
                },
            ),
        ],
        view: () => (node, view, getPos) => {
            let currNode = node;

            const placeholder = {
                loading: 'Loading...',
                empty: 'Add an Image',
                failed: 'Image loads failed',
                ...(options?.placeholder ?? {}),
            };
            const isBlock = options?.isBlock ?? false;
            const nodeType = node.type;
            const renderer = utils.themeManager.get<ThemeImageType>('image', {
                placeholder,
                isBlock,
                onError: (img) => {
                    const pos = getPos();
                    if (!pos) return;

                    const { tr } = view.state;
                    const _tr = tr.setNodeMarkup(pos, nodeType, {
                        ...node.attrs,
                        src: img.src,
                        loading: false,
                        failed: true,
                    });
                    view.dispatch(_tr);
                },
                onLoad: (img) => {
                    const { tr } = view.state;

                    const pos = getPos();
                    if (!pos) return;

                    const _tr = tr.setNodeMarkup(pos, nodeType, {
                        ...node.attrs,
                        width: img.width,
                        src: img.src,
                        loading: false,
                        failed: false,
                    });
                    view.dispatch(_tr);
                },
            });

            if (!renderer) {
                return {};
            }

            const { dom, onUpdate } = renderer;
            onUpdate(currNode);

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    currNode = updatedNode;
                    onUpdate(currNode);

                    return true;
                },
                selectNode: () => {
                    dom.classList.add('ProseMirror-selectednode');
                },
                deselectNode: () => {
                    dom.classList.remove('ProseMirror-selectednode');
                },
            };
        },
        prosePlugins: (type, ctx) => {
            const inputChipRenderer = utils.themeManager.get<ThemeInputChipType>('input-chip', {
                placeholder: options?.input?.placeholder ?? 'Input Image Link',
                buttonText: options?.input?.buttonText,
                onUpdate: (value) => {
                    ctx.get(commandsCtx).call(ModifyImage, value);
                },
            });
            const shouldDisplay = (view: EditorView) => {
                return Boolean(type && findSelectedNodeOfType(view.state.selection, type));
            };
            const getCurrentLink = (view: EditorView) => {
                const result = findSelectedNodeOfType(view.state.selection, type);
                if (!result) return;

                const value = result.node.attrs['src'];
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
