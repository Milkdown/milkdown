import { createProsemirrorPlugin, PluginReadyContext } from '@milkdown/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { itemMap } from './item';
import { SelectionMarksTooltip } from './SelectionMarksTooltip';

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

const selectionMarksTooltipPlugin = (ctx: PluginReadyContext) =>
    new Plugin({
        key: new PluginKey(key),
        view: (editorView) => new SelectionMarksTooltip(ctx, itemMap(ctx), editorView),
    });

export const tooltip = createProsemirrorPlugin('tooltip', (ctx) => [selectionMarksTooltipPlugin(ctx)]);
