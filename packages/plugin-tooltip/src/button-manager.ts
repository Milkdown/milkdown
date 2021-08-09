import { calculateTextPosition } from '@milkdown/utils';
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
        return Object.values(this.#buttonMap)
            .filter((item) => item.enable(this.view))
            .every(({ $ }) => $.classList.contains('hide'));
    }

    private filterButton(view: EditorView) {
        Object.values(this.#buttonMap)
            .filter((item) => item.enable(this.view))
            .forEach((item) => {
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
        calculateTextPosition(view, this.#buttons, (start, end, target, parent) => {
            const selectionWidth = end.left - start.left;
            let left = start.left - parent.left - (target.width - selectionWidth) / 2;
            const top = start.top - parent.top - target.height - 14;

            if (left < 0) left = 0;

            return [top, left];
        });
    }

    private createTooltip() {
        const div = document.createElement('div');
        div.className = 'tooltip';
        Object.values(this.#buttonMap)
            .filter((item) => item.enable(this.view))
            .forEach(({ $ }) => div.appendChild($));
        this.view.dom.parentNode?.appendChild(div);

        return div;
    }

    #listener = (e: Event) => {
        const target = Object.values(this.#buttonMap).find(
            ({ $ }) => e.target instanceof Element && $.contains(e.target),
        );
        if (!target) return;
        e.stopPropagation();
        e.preventDefault();
        target.command();
    };
}
