/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const menuKey = new PluginKey('milkdown-menu');

export const menu = createPlugin(() => {
    return {
        prosePlugins: () => {
            const plugin = new Plugin({
                key: menuKey,
            });

            return [plugin];
        },
    };
});
