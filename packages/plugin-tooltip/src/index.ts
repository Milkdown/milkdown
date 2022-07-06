/* Copyright 2021, Milkdown by Mirone. */
import { Plugin, PluginKey } from '@milkdown/prose/state';
import { AtomList, createPlugin as create } from '@milkdown/utils';

import { buttonMap, TooltipOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = new PluginKey('MILKDOWN_TOOLTIP');
export * from './item';

export const tooltipPlugin = create<string, TooltipOptions>((utils, options) => {
    return {
        id: 'tooltip',
        prosePlugins: (_, ctx) => {
            const manager = createPlugin(buttonMap(ctx, options?.items), utils, options?.bottom ?? false, 'tooltip');
            const plugin = new Plugin({
                key,
                props: {
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
