import type { EditorView } from 'prosemirror-view';
import type { ButtonMap } from './item';

export class ButtonManager {
    #buttons: HTMLDivElement;
    #buttonMap: ButtonMap;
    constructor(buttonMap: ButtonMap, private view: EditorView) {
        this.#buttonMap = buttonMap;
        this.#buttons = this.createTooltip();
        this.#buttons.addEventListener('mousedown', this.#listener);
    }

    destroy() {
        this.#buttons.removeEventListener('mousedown', this.#listener);
        this.#buttons.remove();
    }

    hide() {
        this.#buttons.classList.add('hide');
    }

    update(view: EditorView) {
        const noActive = this.filterButton(view);
        if (noActive) {
            this.hide();
            return;
        }
        this.calcPos(view);
    }

    private get noActive() {
        return Object.values(this.#buttonMap).every(({ $ }) => $.classList.contains('hide'));
    }

    private filterButton(view: EditorView) {
        Object.values(this.#buttonMap).forEach((item) => {
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

        return this.noActive;
    }

    private calcPos(view: EditorView) {
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

    private createTooltip() {
        const div = document.createElement('div');
        div.className = 'tooltip';
        Object.values(this.#buttonMap).forEach(({ $ }) => div.appendChild($));
        this.view.dom.parentNode?.appendChild(div);

        return div;
    }

    #listener = (e: Event) => {
        const { view } = this;
        if (!view) return;
        const target = Object.values(this.#buttonMap).find(
            ({ $ }) => e.target instanceof Element && $.contains(e.target),
        );
        if (!target) return;
        e.stopPropagation();
        e.preventDefault();
        target.command(e, view)(view.state, view.dispatch);
    };
}
