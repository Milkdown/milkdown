import { PluginReadyContext } from '@milkdown/core';
import { EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ItemMap } from './item';

export class SelectionMarksTooltip {
    private $: HTMLDivElement;
    constructor(public ctx: PluginReadyContext, private items: ItemMap, private view: EditorView) {
        this.$ = this.createTooltip();
        this.update(view);

        this.$.addEventListener('mousedown', this.listener);
    }

    update(view: EditorView, prevState?: EditorState) {
        const state = view.state;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        if (state.selection.empty) {
            this.$.classList.add('hide');
            return;
        }

        this.calculateItem(view);
        const noActiveItem = Object.values(this.items).every(({ $ }) => $.classList.contains('hide'));
        if (noActiveItem) return;

        this.$.classList.remove('hide');
        this.calculatePosition(view);
    }

    destroy() {
        this.$.removeEventListener('mousedown', this.listener);
        this.$.remove();
    }

    private createTooltip() {
        const div = document.createElement('div');
        div.className = 'tooltip';
        Object.values(this.items).forEach(({ $ }) => div.appendChild($));
        this.view.dom.parentNode?.appendChild(div);

        return div;
    }

    private calculateItem(view: EditorView) {
        Object.values(this.items).forEach((item) => {
            const disable = item.disable?.(view);
            if (disable) {
                item.$.classList.add('hide');
                return;
            }
            item.$.classList.remove('hide');

            item.update?.(view, item.$);

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
        if (state.selection instanceof TextSelection) {
            const start = view.coordsAtPos(from);
            const end = view.coordsAtPos(to);
            const left = Math.max((start.left + end.left) / 2, start.left + 3);

            const box = this.$.offsetParent?.getBoundingClientRect();
            if (!box) return;

            this.$.style.left = left - box.left + 'px';
            this.$.style.bottom = box.bottom - start.top + 'px';
            return;
        }
        if (state.selection instanceof NodeSelection) {
            const start = view.coordsAtPos(from);
            const end = view.coordsAtPos(to);
            const left = Math.max((start.left + end.left) / 2, start.left + 3);

            const box = this.$.getBoundingClientRect();
            const parent = this.$.offsetParent?.getBoundingClientRect();
            if (!parent) return;

            const leftPx = left - parent.left;

            this.$.style.left = (leftPx < box.width / 2 ? box.width / 2 : leftPx) + 'px';
            this.$.style.bottom = parent.bottom - start.top + 'px';
            return;
        }
    }

    private listener = (e: Event) => {
        const { view } = this;
        if (!view) return;
        e.stopPropagation();
        Object.values(this.items).forEach(({ $, command }) => {
            if ($.contains(e.target as Element)) {
                command(e, view)(view.state, view.dispatch);
            }
        });
    };
}
