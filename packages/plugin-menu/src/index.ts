/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

import { defaultConfig } from './default-config';
import { Manager } from './manager';
import { menubar } from './menubar';

export const menuKey = new PluginKey('milkdown-menu');

export const menu = createPlugin((utils) => {
    return {
        prosePlugins: (_, ctx) => {
            const plugin = new Plugin({
                key: menuKey,
                view: (editorView) => {
                    const menu = menubar(utils, editorView);

                    const manager = new Manager(defaultConfig, utils, ctx, menu);

                    manager;

                    return {};
                },
            });

            return [plugin];
        },
    };
});
