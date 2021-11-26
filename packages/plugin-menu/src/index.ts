/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const menuKey = new PluginKey('milkdown-menu');

export const menu = createPlugin(() => {
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
