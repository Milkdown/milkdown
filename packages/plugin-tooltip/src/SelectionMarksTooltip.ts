import { PluginReadyContext } from '@milkdown/core';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ItemMap } from './item';

export class SelectionMarksTooltip {
    private $: HTMLDivElement;
    constructor(public ctx: PluginReadyContext, private items: ItemMap, private view: EditorView) {
        this.$ = document.createElement('div');
        this.$.className = 'tooltip';
        Object.values(items).forEach(({ $ }) => this.$.appendChild($));
        view.dom.parentNode?.appendChild(this.$);
        this.update(view);

        this.$.addEventListener('mousedown', this.listener);
    }

    update(view: EditorView, prevState?: EditorState) {
        const state = view.state;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        if (state.selection.empty || !(state.selection instanceof TextSelection)) {
            this.hide();
            return;
        }

        this.calculateItem(view);
        this.$.classList.remove('hide');
        this.calculatePosition(view);
    }

    destroy() {
        this.$.removeEventListener('mousedown', this.listener);
        this.$.remove();
    }

    private hide() {
        this.$.classList.add('hide');
    }

    private calculateItem(view: EditorView) {
        Object.values(this.items).forEach((item) => {
            const disable = item.disable?.(view);
            if (disable) {
                item.$.classList.add('hide');
                return;
            }
            item.$.classList.remove('hide');

            const active = item.active(view);
            if (active) {
                item.$.classList.add('active');
                return;
            }
            item.$.classList.remove('active');
        });
    }

    private calculatePosition(view: EditorView) {
        const state = view.state;
        const { from, to } = state.selection;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const left = Math.max((start.left + end.left) / 2, start.left + 3);

        const box = this.$.offsetParent?.getBoundingClientRect();
        if (!box) return;

        this.$.style.left = left - box.left + 'px';
        this.$.style.bottom = box.bottom - start.top + 'px';
    }

    private listener = (e: Event) => {
        const { view } = this;
        if (!view) return;
        e.preventDefault();
        Object.values(this.items).forEach(({ $, command }) => {
            if ($.contains(e.target as Element)) {
                command(view.state, view.dispatch);
            }
        });
    };
}
