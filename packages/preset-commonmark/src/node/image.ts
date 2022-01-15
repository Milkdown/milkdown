/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, themeToolCtx } from '@milkdown/core';
import type { Icon } from '@milkdown/design-system';
import { findSelectedNodeOfType, InputRule } from '@milkdown/prose';
import { createNode } from '@milkdown/utils';

export const ModifyImage = createCmdKey<string>();
export const InsertImage = createCmdKey<string>();
const id = 'image';
export type ImageOptions = {
    isBlock: boolean;
    placeholder: {
        loading: string;
        empty: string;
        failed: string;
    };
};
export const image = createNode<string, ImageOptions>((utils, options) => {
    const placeholder = {
        loading: 'Loading...',
        empty: 'Add an Image',
        failed: 'Image loads failed',
        ...(options?.placeholder ?? {}),
    };
    const isBlock = options?.isBlock ?? false;
    const containerStyle = utils.getStyle(
        (themeTool, { css }) =>
            css`
                display: inline-block;
                position: relative;
                text-align: center;
                font-size: 0;
                vertical-align: text-bottom;
                line-height: 1;

                ${isBlock
                    ? `
                width: 100%;
                margin: 0 auto;
                `
                    : ''}

                &.ProseMirror-selectednode::after {
                    content: '';
                    background: ${themeTool.palette('secondary', 0.38)};
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }

                img {
                    max-width: 100%;
                    height: auto;
                    object-fit: contain;
                    margin: 0 2px;
                }
                .icon,
                .placeholder {
                    display: none;
                }

                &.system {
                    width: 100%;
                    padding: 0 2rem;

                    img {
                        width: 0;
                        height: 0;
                        display: none;
                    }

                    .icon,
                    .placeholder {
                        display: inline;
                    }

                    box-sizing: border-box;
                    height: 3rem;
                    background-color: ${themeTool.palette('background')};
                    border-radius: ${themeTool.size.radius};
                    display: inline-flex;
                    gap: 2rem;
                    justify-content: flex-start;
                    align-items: center;
                    .placeholder {
                        margin: 0;
                        line-height: 1;
                        &::before {
                            content: '';
                            font-size: 0.875rem;
                            color: ${themeTool.palette('neutral', 0.6)};
                        }
                    }
                }

                &.loading {
                    .placeholder {
                        &::before {
                            content: '${placeholder.loading}';
                        }
                    }
                }

                &.empty {
                    .placeholder {
                        &::before {
                            content: '${placeholder.empty}';
                        }
                    }
                }

                &.failed {
                    .placeholder {
                        &::before {
                            content: '${placeholder.failed}';
                        }
                    }
                }
            `,
    );

    const style = utils.getStyle(
        (_, { css }) =>
            css`
                display: inline-block;
                margin: 0 auto;
                object-fit: contain;
                width: 100%;
                position: relative;
                height: auto;
                text-align: center;
            `,
    );

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
                            node.attrs.failed ? 'failed' : '',
                            node.attrs.loading ? 'loading' : '',
                            style,
                        ),
                    },
                ];
            },
            parseMarkdown: {
                match: ({ type }) => type === id,
                runner: (state, node, type) => {
                    const url = node.url as string;
                    const alt = node.alt as string;
                    const title = node.title as string;
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
                        title: node.attrs.title,
                        url: node.attrs.src,
                        alt: node.attrs.alt,
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
        view: (ctx) => (node, view, getPos) => {
            const nodeType = node.type;
            const createIcon = ctx.get(themeToolCtx).slots.icon;
            const container = document.createElement('span');
            container.className = utils.getClassName(node.attrs, id, containerStyle);

            const content = document.createElement('img');

            container.append(content);
            let icon = createIcon('image');
            const placeholder = document.createElement('span');
            placeholder.classList.add('placeholder');
            container.append(icon, placeholder);

            const setIcon = (name: Icon) => {
                const nextIcon = createIcon(name);
                container.replaceChild(nextIcon, icon);
                icon = nextIcon;
            };

            const loadImage = (src: string) => {
                container.classList.add('system', 'loading');
                setIcon('loading');
                const img = document.createElement('img');
                img.src = src;

                img.onerror = () => {
                    const { tr } = view.state;
                    const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                        ...node.attrs,
                        src,
                        loading: false,
                        failed: true,
                    });
                    view.dispatch(_tr);
                };

                img.onload = () => {
                    const { tr } = view.state;
                    const _tr = tr.setNodeMarkup(getPos(), nodeType, {
                        ...node.attrs,
                        width: img.width,
                        src,
                        loading: false,
                        failed: false,
                    });
                    view.dispatch(_tr);
                };
            };

            const { src, loading, title, alt, width } = node.attrs;
            content.src = src;
            content.title = title || alt;
            content.alt = alt;
            if (width) {
                content.width = width;
            }

            if (src.length === 0) {
                container.classList.add('system', 'empty');
                setIcon('image');
            } else if (loading) {
                loadImage(src);
            }

            return {
                dom: container,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== id) return false;

                    const { src, alt, title, loading, failed, width } = updatedNode.attrs;
                    content.src = src;
                    content.alt = alt;
                    content.title = title || alt;
                    if (width) {
                        content.width = width;
                    }
                    if (loading) {
                        loadImage(src);
                        return true;
                    }
                    if (failed) {
                        container.classList.remove('loading', 'empty');
                        container.classList.add('system', 'failed');
                        setIcon('brokenImage');
                        return true;
                    }
                    if (src.length > 0) {
                        container.classList.remove('system', 'empty', 'loading');
                        return true;
                    }

                    container.classList.add('system', 'empty');
                    setIcon('image');
                    return true;
                },
                selectNode: () => {
                    container.classList.add('ProseMirror-selectednode');
                },
                deselectNode: () => {
                    container.classList.remove('ProseMirror-selectednode');
                },
            };
        },
    };
});
