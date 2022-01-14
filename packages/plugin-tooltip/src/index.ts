/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx } from '@milkdown/core';
import { Plugin, PluginKey } from '@milkdown/prose';
import { AtomList, createPlugin as create } from '@milkdown/utils';

import { buttonMap, inputMap, InputOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = new PluginKey('MILKDOWN_PLUGIN_TOOLTIP');

export const tooltipPlugin = create<string, InputOptions>((utils, options) => {
    return {
        id: 'tooltip',
        prosePlugins: (_, ctx) => {
            const schema = ctx.get(schemaCtx);
            const manager = createPlugin(
                buttonMap(schema, ctx),
                inputMap(schema, ctx, {
                    link: {
                        placeholder: 'Input Web Link',
                        buttonText: 'APPLY',
                        ...(options?.link ?? {}),
                    },
                    image: {
                        placeholder: 'Input Image Link',
                        buttonText: 'APPLY',
                        ...(options?.image ?? {}),
                    },
                    inlineMath: {
                        placeholder: 'Input Math',
                        ...(options?.inlineMath ?? {}),
                    },
                }),
                utils,
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
                    manager.render(editorView);
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
