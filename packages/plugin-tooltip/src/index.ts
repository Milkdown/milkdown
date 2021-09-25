/* Copyright 2021, Milkdown by Mirone. */
import { schemaCtx } from '@milkdown/core';
import { AtomList, createProsePlugin } from '@milkdown/utils';
import { Plugin, PluginKey } from 'prosemirror-state';

import { buttonMap, inputMap, InputOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = new PluginKey('MILKDOWN_PLUGIN_TOOLTIP');

export const tooltipPlugin = createProsePlugin<InputOptions>((options, utils) => {
    const schema = utils.ctx.get(schemaCtx);
    const plugin = createPlugin(
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
        }),
        utils,
    );
    return new Plugin({
        key,
        props: {
            handleKeyDown: () => {
                plugin.setHide(true);
                return false;
            },
            handleClick: (view) => {
                plugin.setHide(false);
                plugin.update(view);
                return false;
            },
        },
        view: (editorView) => {
            plugin.render(editorView);
            return {
                update: plugin.update,
                destroy: plugin.destroy,
            };
        },
    });
});

export const tooltip = AtomList.create([tooltipPlugin()]);
