/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, Ctx } from '@milkdown/core';
import { selectParentNode } from '@milkdown/prose/commands';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { EditorView } from '@milkdown/prose/view';
import { AtomList, createPlugin } from '@milkdown/utils';

import { Config, defaultConfig, SelectParent } from './default-config';
import { Manager } from './manager';
import { HandleDOM, menubar } from './menubar';

export const menuKey = new PluginKey('MILKDOWN_MENU');

export * from './default-config';
export type { HandleDOM, HandleDOMParams } from './menubar';

export type Options = {
    config: Config;
    domHandler: HandleDOM;
};

export const menuPlugin = createPlugin<string, Options>((utils, options) => {
    const config = options?.config ?? defaultConfig;
    const domHandler = options?.domHandler;

    let restoreDOM: (() => void) | null = null;
    let menu: HTMLDivElement | null = null;
    let manager: Manager | null = null;

    const initIfNecessary = (ctx: Ctx, editorView: EditorView) => {
        if (!editorView.editable) {
            return;
        }

        if (!menu) {
            const [_menu, _restoreDOM] = menubar(utils, editorView, ctx, domHandler);
            menu = _menu;
            restoreDOM = () => {
                _restoreDOM();
                menu = null;
                manager = null;
            };
        }

        if (!manager) {
            manager = new Manager(config, utils, ctx, menu, editorView);
        }
    };

    return {
        commands: () => [createCmd(SelectParent, () => selectParentNode)],
        prosePlugins: (_, ctx) => {
            const plugin = new Plugin({
                key: menuKey,
                view: (editorView) => {
                    initIfNecessary(ctx, editorView);
                    if (editorView.editable) {
                        manager?.update(editorView);
                    }
                    return {
                        update: (view) => {
                            initIfNecessary(ctx, editorView);
                            if (editorView.editable) {
                                manager?.update(view);
                            } else {
                                restoreDOM?.();
                            }
                        },
                        destroy: () => {
                            restoreDOM?.();
                        },
                    };
                },
            });

            return [plugin];
        },
    };
});

export const menu = AtomList.create([menuPlugin()]);
