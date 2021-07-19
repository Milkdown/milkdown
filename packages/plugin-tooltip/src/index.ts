import { prosePluginFactory } from '@milkdown/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { buttonMap, inputMap } from './item';
import { SelectionMarksTooltip } from './selection-marks-tooltip';

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

const selectionMarksTooltipPlugin = () =>
    new Plugin({
        key: new PluginKey(key),
        view: (editorView) =>
            new SelectionMarksTooltip(
                buttonMap(editorView.state.schema),
                inputMap(editorView.state.schema),
                editorView,
            ),
    });

export const tooltip = prosePluginFactory(selectionMarksTooltipPlugin());
