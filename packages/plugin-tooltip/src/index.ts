/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createProsePlugin } from '@milkdown/utils';
import { Plugin, PluginKey } from 'prosemirror-state';

import { buttonMap, inputMap, InputOptions } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

export const tooltipPlugin = createProsePlugin<InputOptions>(
    (options, utils) =>
        new Plugin({
            key: new PluginKey(key),
            view: (editorView) =>
                createPlugin(
                    buttonMap(editorView.state.schema, utils.ctx),
                    inputMap(editorView.state.schema, utils.ctx, {
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
                    editorView,
                    utils,
                ),
        }),
);

export const tooltip = AtomList.create([tooltipPlugin()]);
