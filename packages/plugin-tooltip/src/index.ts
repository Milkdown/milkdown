/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx } from '@milkdown/core';
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { AtomList, createPlugin as create } from '@milkdown/utils';

import { buttonMap, TooltipOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = new PluginKey('MILKDOWN_PLUGIN_TOOLTIP');

export const tooltipPlugin = create<string, TooltipOptions>((utils, options) => {
    return {
        id: 'tooltip',
        prosePlugins: (_, ctx) => {
            const schema = ctx.get(schemaCtx);
            const manager = createPlugin(
                buttonMap(schema, ctx, options?.items),
                utils,
                options?.bottom ?? false,
                'tooltip',
            );
            const plugin = new Plugin({
                key,
                props: {
                    handleKeyDown: () => {
                        manager.setHide(true);
                        return false;
                    },
                    handleClick: (view) => {
                        manager.setHide(false);
                        manager.update(view);
                        return false;
                    },
                    handleDOMEvents: {
                        mousedown: () => {
                            manager.setHide(false);
                            return false;
                        },
                    },
                },
                view: (editorView) => {
                    manager.recreate(editorView);
                    return {
                        update: manager.update,
                        destroy: manager.destroy,
                    };
                },
            });
            return [plugin];
        },
    };
});

export const tooltip = AtomList.create([tooltipPlugin()]);
