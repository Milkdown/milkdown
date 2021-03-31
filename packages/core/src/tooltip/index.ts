import { ViewPlugin } from '../utility/prosemirror';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

class Tooltip implements ViewPlugin {
    private $tooltip: HTMLDivElement;
    private offsetParent: Element | null;
    constructor(editorView: EditorView) {
        this.$tooltip = document.createElement('div');
        this.$tooltip.className = 'tooltip';
        this.$tooltip.style.position = 'absolute';
        editorView.dom.parentNode?.appendChild(this.$tooltip);
        this.offsetParent = this.$tooltip.offsetParent;

        this.update(editorView);
    }

    public update(view: EditorView, prevState?: EditorState): void {
        if (!this.offsetParent) return;

        const { state } = view;
        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) {
            return;
        }

        if (state.selection.empty) {
            this.$tooltip.style.display = 'none';
            return;
        }

        this.$tooltip.style.display = 'block';
        const { from, to } = state.selection;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const box = this.offsetParent.getBoundingClientRect();
        const left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.$tooltip.style.left = left - box.left + 'px';
        this.$tooltip.style.bottom = box.bottom - start.top + 'px';
        this.$tooltip.textContent = (to - from).toString();
    }

    public destroy() {
        this.$tooltip.remove();
    }
}

export const tooltip = new Plugin({
    view: (editorView) => new Tooltip(editorView),
});
