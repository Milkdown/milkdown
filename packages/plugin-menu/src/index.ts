/* Copyright 2021, Milkdown by Mirone. */
import { createCmd } from '@milkdown/core';
import { Plugin, PluginKey, selectParentNode } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

import { Config, defaultConfig, SelectParent } from './default-config';
import { Manager } from './manager';
import { HandleDOM, menubar } from './menubar';

export const menuKey = new PluginKey('MILKDOWN_PLUGIN_MENU');

export type { HandleDOM, HandleDOMParams } from './menubar';

export type Options = {
    config: Config;
    domHandler: HandleDOM;
};

export const menu = createPlugin<string, Options>((utils, options) => {
    const config = options?.config ?? defaultConfig;
    const domHandler = options?.domHandler;
    return {
        commands: () => [createCmd(SelectParent, () => selectParentNode)],
        prosePlugins: (_, ctx) => {
            const plugin = new Plugin({
                key: menuKey,
                view: (editorView) => {
                    const menu = menubar(utils, editorView, ctx, domHandler);

                    const manager = new Manager(config, utils, ctx, menu, editorView);

                    return {
                        update: (view) => {
                            manager.update(view);
                        },
                    };
                },
            });

            return [plugin];
        },
    };
});
