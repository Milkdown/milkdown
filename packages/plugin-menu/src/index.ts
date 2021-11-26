/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import type { Icon } from '@milkdown/design-system';
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const menuKey = new PluginKey('milkdown-menu');

type Config = Array<IconConfig | DividerConfig | SelectConfig>;
type IconConfig = {
    type: 'icon';
    icon: Icon;
};
type DividerConfig = {
    type: 'divider';
};
type SelectConfig = {
    type: 'select';
    options: string[];
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
    const selectStyle = utils.getStyle((themeTool) => {
        return css`
            justify-content: space-between;
            align-items: center;
            width: 12.375rem;
            color: ${themeTool.palette('neutral', 0.87)};
            display: flex;
            cursor: pointer;
            position: relative;
            padding: 0.25rem 0.5rem;

            .menu-selector-value {
                flex: 1;
                font-weight: 500;
            }

            .menu-selector-list {
                position: absolute;
                top: 2.5rem;
                left: -0.5rem;
                background: ${themeTool.palette('surface')};
                right: -0.5rem;
                ${themeTool.mixin.border()};
                ${themeTool.mixin.shadow()};
                border-bottom-left-radius: ${themeTool.size.radius};
                border-bottom-right-radius: ${themeTool.size.radius};
                z-index: 1;
            }

            .menu-selector-list-item {
                padding: 0.75rem 1rem;
                line-height: 1.5rem;
            }

            background: ${themeTool.palette('secondary', 0.12)};

            &.fold {
                background: unset;

                .menu-selector-list {
                    display: none;
                }
            }
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
            type: 'select',
            options: ['Large Heading', 'Medium Heading', 'Small Heading', 'Paragraph', '...'],
        },
        {
            type: 'divider',
        },
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
                    if (menuStyle) {
                        menu.classList.add(menuStyle);
                    }

                    config.forEach((item) => {
                        if (item.type === 'select') {
                            const selector = document.createElement('div');
                            selector.classList.add('menu-selector', 'fold');
                            selector.addEventListener('mousedown', (e) => {
                                e.preventDefault();
                                selector.classList.toggle('fold');
                            });

                            const selectorValue = document.createElement('span');
                            selectorValue.classList.add('menu-selector-value');
                            selectorValue.textContent = item.options[0];

                            const selectorButton = utils.themeTool.slots.icon('downArrow');
                            selector.appendChild(selectorValue);
                            selector.appendChild(selectorButton);

                            const selectorList = document.createElement('div');
                            selectorList.classList.add('menu-selector-list');
                            item.options.forEach((option) => {
                                const selectorListItem = document.createElement('div');
                                selectorListItem.textContent = option;
                                selectorListItem.classList.add('menu-selector-list-item');
                                selectorList.appendChild(selectorListItem);
                            });

                            selector.appendChild(selectorList);

                            if (selectStyle) {
                                selector.classList.add(selectStyle);
                            }
                            menu.appendChild(selector);

                            return;
                        }

                        if (item.type === 'divider') {
                            const divider = document.createElement('div');
                            if (dividerStyle) {
                                divider.classList.add(dividerStyle);
                            }
                            menu.appendChild(divider);
                            return;
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
