import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { buttonMap, inputMap } from './item';
import { SelectionMarksTooltip } from './selection-marks-tooltip';

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

const selectionMarksTooltipPlugin = (ctx: PluginReadyContext) =>
    new Plugin({
        key: new PluginKey(key),
        view: (editorView) => new SelectionMarksTooltip(buttonMap(ctx), inputMap(ctx), editorView),
    });

export const tooltip = createProsemirrorPlugin('tooltip', (ctx) => [selectionMarksTooltipPlugin(ctx)]);
