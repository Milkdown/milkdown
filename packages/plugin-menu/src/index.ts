/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

import { button, ButtonConfig } from './button';
import { defaultConfig } from './default-config';
import { divider, DividerConfig } from './divider';
import { select, SelectConfig } from './select';

export const menuKey = new PluginKey('milkdown-menu');

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

    return {
        prosePlugins: (_, ctx) => {
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

                    defaultConfig
                        .map(
                            (x, i): Array<ButtonConfig | DividerConfig | SelectConfig> =>
                                i === defaultConfig.length - 1 ? x : [...x, { type: 'divider' } as DividerConfig],
                        )
                        .flat()
                        .forEach((item) => {
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
                                const $button = button(utils, item, ctx);
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
