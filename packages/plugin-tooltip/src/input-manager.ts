import { calculateTextPosition } from '@milkdown/utils';
import type { EditorView } from 'prosemirror-view';
import type { Event2Command, InputMap } from './item';

export class InputManager {
    #input: HTMLDivElement;
    #inputMap: InputMap;
    #inputCommand?: Event2Command;

    constructor(inputMap: InputMap, private view: EditorView) {
        this.#inputMap = inputMap;
        this.#input = this.createInput();

        this.#input.addEventListener('mousedown', this.listener);
    }

    destroy() {
        this.#input.removeEventListener('mousedown', this.listener);
        this.#input.remove();
    }

    hide() {
        this.#input.classList.add('hide');
        this.#inputCommand = undefined;
    }

    update(view: EditorView) {
        const result = this.filterInput(view);
        if (!result) return;
        this.calcPos(view);
    }

    private calcPos(view: EditorView) {
        calculateTextPosition(view, this.#input, (start, end, target, parent) => {
            const selectionWidth = end.left - start.left;
            let left = start.left - parent.left - (target.width - selectionWidth) / 2;
            const top = start.bottom - parent.top + 14;

            if (left < 0) left = 0;

            return [top, left];
        });
        return;
    }

    private createInput() {
        const div = document.createElement('div');
        div.className = 'tooltip-input';
        const input = document.createElement('input');
        div.appendChild(input);
        const button = document.createElement('button');
        button.textContent = 'APPLY';
        div.appendChild(button);
        this.view.dom.parentNode?.appendChild(div);

        return div;
    }

    private filterInput(view: EditorView) {
        const target = Object.values(this.#inputMap).find((input) => {
            return input.display(view);
        });
        if (!target) {
            this.#input.classList.add('hide');
            return false;
        }

        this.#input.classList.remove('hide');
        this.#inputCommand = target.command;
        this.#input.firstElementChild?.setAttribute('placeholder', target.placeholder);
        target.update(view, this.#input);
        return true;
    }

    private listener = (e: Event) => {
        const { view } = this;
        const command = this.#inputCommand;
        if (!view || !command) return;

        e.stopPropagation();
        command(e, view)(view.state, view.dispatch);
    };
}
