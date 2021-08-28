import type { Ctx } from '@milkdown/core';
import type { EditorView } from 'prosemirror-view';

import type { Event2Command, InputMap } from '../item';
import { calcInputPos } from './calc-input-pos';
import { createInput } from './create-input';
import { filterInput } from './filter-input';

export const createInputManager = (inputMap: InputMap, view: EditorView, ctx: Ctx) => {
    let inputCommand: Event2Command | undefined;
    const setCommand = (x?: Event2Command) => (inputCommand = x);

    const wrapper = view.dom.parentNode;
    if (!wrapper) throw new Error();

    const [input, button] = createInput(ctx);
    wrapper.appendChild(input);

    const onClick = (e: Event) => {
        if (!inputCommand || button.classList.contains('disable')) return;

        e.stopPropagation();
        inputCommand(e);
    };

    button.addEventListener('mousedown', onClick);

    return {
        destroy: () => {
            input.removeEventListener('mousedown', onClick);
            button.remove();
        },
        hide: () => {
            input.classList.add('hide');
            setCommand();
        },
        update: (editorView: EditorView) => {
            const result = filterInput(editorView, inputMap, input);
            if (!result) return;
            setCommand(result);
            calcInputPos(editorView, input);
        },
    };
};
