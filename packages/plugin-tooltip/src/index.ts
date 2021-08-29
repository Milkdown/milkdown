import { AtomList, createProsePlugin } from '@milkdown/utils';
import { Plugin, PluginKey } from 'prosemirror-state';

import { buttonMap, inputMap } from './item';
import { createPlugin } from './selection-marks-tooltip';

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

export const tooltipPlugin = createProsePlugin(
    (_, utils) =>
        new Plugin({
            key: new PluginKey(key),
            view: (editorView) =>
                createPlugin(
                    buttonMap(editorView.state.schema, utils.ctx),
                    inputMap(editorView.state.schema, utils.ctx),
                    editorView,
                    utils,
                ),
        }),
);

export const tooltip = AtomList.create([tooltipPlugin()]);
