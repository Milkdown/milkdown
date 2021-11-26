/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import type { Icon } from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const menuKey = new PluginKey('milkdown-menu');

type Config = Array<IconConfig | Divider>;
type IconConfig = {
    type: 'icon';
    icon: Icon;
};
type Divider = {
    type: 'divider';
};

export const menu = createPlugin((utils) => {
    const menuStyle = utils.getStyle((themeTool) => {
        return css`
            padding: 0.5rem;
            ${themeTool.mixin.border('bottom')};
            display: flex;
            gap: 1rem;
        `;
    });
    const dividerStyle = utils.getStyle((themeTool) => {
        return css`
            width: ${themeTool.size.lineWidth};
            background-color: ${themeTool.palette('line')};
            margin: 0.25rem 0;
        `;
    });
    const buttonStyle = utils.getStyle((themeTool) => {
        return css`
            width: 2rem;
            height: 2rem;

            display: flex;
            justify-content: center;
            align-items: center;

            background-color: ${themeTool.palette('surface')};
            color: ${themeTool.palette('solid')};
            transition: all 0.4s ease-in-out;

            cursor: pointer;

            &:hover {
                background-color: ${themeTool.palette('secondary', 0.12)};
                color: ${themeTool.palette('primary')};
            }
        `;
    });

    const config: Config = [
        {
            type: 'icon',
            icon: 'bold',
        },
        {
            type: 'icon',
            icon: 'italic',
        },
        {
            type: 'icon',
            icon: 'strikeThrough',
        },
        {
            type: 'divider',
        },
        {
            type: 'icon',
            icon: 'bulletList',
        },
        {
            type: 'icon',
            icon: 'orderedList',
        },
        {
            type: 'icon',
            icon: 'taskList',
        },
        {
            type: 'divider',
        },
        {
            type: 'icon',
            icon: 'link',
        },
        {
            type: 'icon',
            icon: 'image',
        },
        {
            type: 'icon',
            icon: 'table',
        },
        {
            type: 'icon',
            icon: 'code',
        },
        {
            type: 'divider',
        },
        {
            type: 'icon',
            icon: 'quote',
        },
        {
            type: 'icon',
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
                    menu.classList.add('milkdown-menu');
                    if (menuStyle) {
                        menu.classList.add(menuStyle);
                    }

                    config.forEach((item) => {
                        if (item.type === 'divider') {
                            const divider = document.createElement('div');
                            if (dividerStyle) {
                                divider.classList.add(dividerStyle);
                            }
                            menu.appendChild(divider);
                        }

                        if (item.type === 'icon') {
                            const iconButton = document.createElement('div');
                            if (buttonStyle) {
                                iconButton.classList.add(buttonStyle);
                            }
                            const icon = utils.themeTool.slots.icon(item.icon);
                            iconButton.appendChild(icon);
                            menu.appendChild(iconButton);
                            return;
                        }
                    });

                    const editorDom = editorView.dom;
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
