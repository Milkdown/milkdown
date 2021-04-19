import { createProsemirrorPlugin } from '@milkdown/core';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

class SelectionMarksTooltip {
    private $: HTMLDivElement;
    constructor(view: EditorView) {
        this.$ = document.createElement('div');
        this.$.className = 'tooltip';
        view.dom.parentNode?.appendChild(this.$);
        this.update(view);
    }

    update(view: EditorView, prevState?: EditorState) {
        const state = view.state;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        if (state.selection.empty) {
            this.$.style.display = 'none';
            return;
        }

        this.$.style.display = '';
        console.log(state.selection);
        const { from, to } = state.selection;

        const box = this.$.offsetParent?.getBoundingClientRect();
        if (!box) return;

        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.$.style.left = left - box.left + 'px';
        this.$.style.bottom = box.bottom - start.top + 'px';
        this.$.textContent = `${to - from}`;
    }
}

export const key = 'MILKDOWN_PLUGIN_TOOLTIP';

const selectionMarksTooltipPlugin = new Plugin({
    key: new PluginKey(key),
    view: (editorView) => new SelectionMarksTooltip(editorView),
});

export const tooltip = createProsemirrorPlugin('tooltip', () => [selectionMarksTooltipPlugin]);
