/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import type { Event2Command, InputMap } from '../item';
import { calcInputPos } from './calc-input-pos';
import { createInput } from './create-input';
import { filterInput } from './filter-input';

export const createInputManager = (inputMap: InputMap, utils: Utils) => {
    let inputCommand: Event2Command | undefined;
    let binding = false;
    const setCommand = (x?: Event2Command) => (inputCommand = x);

    const { div, button, input } = createInput(utils);

    const onClick = (e: Event) => {
        if (!inputCommand || button.classList.contains('disable')) return;

        e.stopPropagation();
        inputCommand(e);
        div.classList.add('hide');
    };
    const onInput = (e: Event) => {
        if (!binding || !inputCommand) return;
        inputCommand(e);
    };

    input.addEventListener('input', onInput);
    button.addEventListener('mousedown', onClick);

    return {
        destroy: () => {
            input.removeEventListener('input', onInput);
            div.removeEventListener('mousedown', onClick);
            div.remove();
        },
        hide: () => {
            div.classList.add('hide');
            setCommand();
        },
        update: (editorView: EditorView) => {
            const result = filterInput(editorView, inputMap, div, input, button);
            if (!result) return;
            binding = !!result.bind;
            setCommand(result.command);
            calcInputPos(editorView, div);
        },
        render: (editorView: EditorView) => {
            const wrapper = editorView.dom.parentNode;
            if (!wrapper) throw new Error();
            wrapper.appendChild(div);
        },
    };
};
