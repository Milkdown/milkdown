import { createProsemirrorPlugin } from '@milkdown/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

class SelectionMarksTooltip {
    constructor(view: EditorView) {
        console.log(view.dom.parentNode);
    }
}

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

const selectionMarksTooltipPlugin = new Plugin({
    key: new PluginKey(key),
    view: (editorView) => new SelectionMarksTooltip(editorView),
});

export const tooltip = createProsemirrorPlugin('tooltip', [selectionMarksTooltipPlugin]);
