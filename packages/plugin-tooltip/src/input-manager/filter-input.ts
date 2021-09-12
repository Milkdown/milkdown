/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from 'prosemirror-view';

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
    input.placeholder = target.placeholder;
    button.textContent = target.buttonText;
    target.update(currentView, div);
    return target.command;
};
