import { css } from '@emotion/css';
import { Ctx, themeToolCtx } from '@milkdown/core';
import { calculateTextPosition } from '@milkdown/utils';
import type { EditorView } from 'prosemirror-view';

import type { Event2Command, InputMap } from './item';

export class InputManager {
    #input: HTMLDivElement;
    #button: HTMLButtonElement;
    #inputMap: InputMap;
    #inputCommand?: Event2Command;

    constructor(inputMap: InputMap, private view: EditorView, ctx: Ctx) {
        this.#inputMap = inputMap;
        const [input, button] = this.createInput(ctx);
        this.#input = input;
        this.#button = button;

        this.#button.addEventListener('mousedown', this.listener);
    }

    destroy() {
        this.#input.removeEventListener('mousedown', this.listener);
        this.#button.remove();
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

    private createInput(ctx: Ctx) {
        const div = document.createElement('div');
        const themeTool = ctx.get(themeToolCtx);
        const { palette, widget, size } = themeTool;

        const style = css`
            ${widget.border?.()};

            ${widget.shadow?.()};

            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            position: absolute;
            background: ${palette('surface')};
            border-radius: ${size.radius};
            font-size: 1rem;

            height: 3.5rem;
            box-sizing: border-box;
            width: 20.5rem;
            padding: 0 1rem;
            gap: 1rem;

            input,
            button {
                all: unset;
            }

            input {
                flex-grow: 1;
                caret-color: ${palette('primary')};
                &::placeholder {
                    color: ${palette('neutral', 0.6)};
                }
            }

            button {
                cursor: pointer;
                height: 2.25rem;
                color: ${palette('primary')};
                font-size: 0.875rem;
                padding: 0 0.5rem;
                font-weight: 500;
                letter-spacing: 1.25px;
                &:hover {
                    background-color: ${palette('secondary', 0.12)};
                }
                &.disable {
                    color: ${palette('neutral', 0.38)};
                    cursor: not-allowed;
                    &:hover {
                        background: transparent;
                    }
                }
            }

            &.hide {
                display: none;
            }
        `;

        div.classList.add('tooltip-input', style);

        const input = document.createElement('input');
        div.appendChild(input);
        const button = document.createElement('button');
        button.textContent = 'APPLY';
        div.appendChild(button);
        this.view.dom.parentNode?.appendChild(div);
        input.addEventListener('input', (e) => {
            if (!(e instanceof InputEvent)) {
                return;
            }
            const { target } = e;
            if (!(target instanceof HTMLInputElement)) {
                return;
            }
            if (!target.value) {
                button.classList.add('disable');
                return;
            }
            if (button.classList.contains('disable')) {
                button.classList.remove('disable');
            }
        });

        return [div, button] as const;
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
        const command = this.#inputCommand;
        if (!command || this.#button.classList.contains('disable')) return;

        e.stopPropagation();
        command(e);
    };
}
