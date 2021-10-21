/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx } from '@milkdown/core';
import { Plugin, PluginKey } from '@milkdown/prose';
import { AtomList, createProsePlugin } from '@milkdown/utils';

import { buttonMap, inputMap, InputOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = new PluginKey('MILKDOWN_PLUGIN_TOOLTIP');

export const tooltipPlugin = createProsePlugin<InputOptions>((options, utils) => {
    const schema = utils.ctx.get(schemaCtx);
    const manager = createPlugin(
        buttonMap(schema, utils.ctx),
        inputMap(schema, utils.ctx, {
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
        options?.isFixed,
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
        },
        view: (editorView) => {
            manager.render(editorView);
            return {
                update: manager.update,
                destroy: manager.destroy,
            };
        },
    });

    return {
        id: 'tooltip',
        plugin,
    };
});

export const tooltip = AtomList.create([tooltipPlugin()]);
