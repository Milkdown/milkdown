/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';

import type { InputMap } from '../item';

export const filterInput = (
    currentView: EditorView,
    inputMap: InputMap,
    div: HTMLDivElement,
    input: HTMLInputElement,
    button: HTMLButtonElement,
) => {
    const target = Object.values(inputMap).find((input) => input.display(currentView));

    if (!target) {
        div.classList.add('hide');
        return;
    }

    div.classList.remove('hide');

    if (target.bind) {
        button.classList.add('hide');
    } else {
        button.classList.remove('hide');
        button.textContent = target.buttonText;
    }

    input.placeholder = target.placeholder;
    target.update(currentView, div);

    return target;
};
