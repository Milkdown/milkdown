import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ButtonMap } from './item';

export class SelectionMarksTooltip {
    #buttons: HTMLDivElement;
    #input: HTMLDivElement;

    constructor(private items: ButtonMap, private view: EditorView) {
        this.#buttons = this.createTooltip();
        this.#input = this.createInput();
        this.update(view);

        this.#buttons.addEventListener('mousedown', this.listener);
    }

    update(view: EditorView, prevState?: EditorState) {
        if (!view.editable) {
            this.hide();
            return;
        }

        const state = view.state;

        if (state.selection.empty) {
            this.hide();
            return;
        }

        this.calculateItem(view);
        const noActiveItem = Object.values(this.items).every(({ $ }) => $.classList.contains('hide'));
        if (noActiveItem) return;

        if (prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection)) return;

        this.calculatePosition(view);
    }

    destroy() {
        this.#buttons.removeEventListener('mousedown', this.listener);
        this.#buttons.remove();
    }

    private hide() {
        this.#buttons.classList.add('hide');
        this.#input.classList.add('hide');
    }

    private createTooltip() {
        const div = document.createElement('div');
        div.className = 'tooltip';
        Object.values(this.items).forEach(({ $ }) => div.appendChild($));
        this.view.dom.parentNode?.appendChild(div);

        return div;
    }

    private createInput() {
        const div = document.createElement('div');
        div.className = 'tooltip-input';
        const input = document.createElement('input');
        div.appendChild(input);
        const button = document.createElement('button');
        div.appendChild(button);
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
        this.#buttons.classList.remove('hide');
        const state = view.state;
        const { from, to } = state.selection;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const left = Math.max((start.left + end.left) / 2, start.left + 3);

        const box = this.#buttons.offsetParent?.getBoundingClientRect();
        if (!box) return;

        this.#buttons.style.left = left - box.left + 'px';
        this.#buttons.style.bottom = box.bottom - start.top + 'px';
        return;
    }

    private listener = (e: Event) => {
        const { view } = this;
        if (!view) return;
        const target = Object.values(this.items).find(({ $ }) => e.target instanceof Element && $.contains(e.target));
        if (!target) return;
        e.stopPropagation();
        e.preventDefault();
        target.command(e, view)(view.state, view.dispatch);
    };
}
