/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

import { button, ButtonConfig } from './button';
import { divider, DividerConfig } from './divider';
import { select, SelectConfig } from './select';

export const menuKey = new PluginKey('milkdown-menu');

type Config = Array<SelectConfig | DividerConfig | ButtonConfig>;

export const menu = createPlugin((utils) => {
    const editorWrapperStyle = utils.getStyle((themeTool) => {
        return css`
            ${themeTool.mixin.scrollbar('y')};
        `;
    });
    const menuStyle = utils.getStyle((themeTool) => {
        return css`
            box-sizing: border-box;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            ${themeTool.mixin.border()};
        `;
    });

    const config: Config = [
        {
            type: 'select',
            options: ['Large Heading', 'Medium Heading', 'Small Heading', 'Paragraph'],
        },
        {
            type: 'divider',
        },
        {
            type: 'button',
            icon: 'bold',
        },
        {
            type: 'button',
            icon: 'italic',
        },
        {
            type: 'button',
            icon: 'strikeThrough',
        },
        {
            type: 'divider',
        },
        {
            type: 'button',
            icon: 'bulletList',
        },
        {
            type: 'button',
            icon: 'orderedList',
        },
        {
            type: 'button',
            icon: 'taskList',
        },
        {
            type: 'divider',
        },
        {
            type: 'button',
            icon: 'link',
        },
        {
            type: 'button',
            icon: 'image',
        },
        {
            type: 'button',
            icon: 'table',
        },
        {
            type: 'button',
            icon: 'code',
        },
        {
            type: 'divider',
        },
        {
            type: 'button',
            icon: 'quote',
        },
        {
            type: 'button',
            icon: 'divider',
        },
    ];

    return {
        prosePlugins: () => {
            const plugin = new Plugin({
                key: menuKey,
                view: (editorView) => {
                    const menuWrapper = document.createElement('div');
                    const menu = document.createElement('div');
                    menuWrapper.appendChild(menu);
                    menuWrapper.classList.add('milkdown-menu-wrapper');
                    if (menuStyle) {
                        menu.classList.add(menuStyle);
                    }

                    config.forEach((item) => {
                        if (item.type === 'select') {
                            const $select = select(utils, item);
                            menu.appendChild($select);
                            return;
                        }

                        if (item.type === 'divider') {
                            const $divider = divider(utils);
                            menu.appendChild($divider);
                            return;
                        }

                        if (item.type === 'button') {
                            const $button = button(utils, item);
                            menu.appendChild($button);
                            return;
                        }
                    });

                    const editorDom = editorView.dom;
                    if (editorWrapperStyle) {
                        editorDom.classList.add(editorWrapperStyle);
                    }
                    const parent = editorDom.parentNode;
                    if (!parent) {
                        throw new Error('No parent node found');
                    }
                    parent.replaceChild(menuWrapper, editorDom);
                    menuWrapper.appendChild(editorDom);

                    return {};
                },
            });

            return [plugin];
        },
    };
});
