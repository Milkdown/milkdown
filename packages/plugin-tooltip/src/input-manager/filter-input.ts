import type { EditorView } from 'prosemirror-view';

import type { InputMap } from '../item';

export const filterInput = (currentView: EditorView, inputMap: InputMap, input: HTMLDivElement) => {
    const target = Object.values(inputMap).find((input) => input.display(currentView));

    if (!target) {
        input.classList.add('hide');
        return;
    }

    input.classList.remove('hide');
    input.firstElementChild?.setAttribute('placeholder', target.placeholder);
    target.update(currentView, input);
    return target.command;
};
