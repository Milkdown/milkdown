import { Utils } from '@milkdown/utils';
import type { EditorView } from 'prosemirror-view';

import type { Event2Command, InputMap } from '../item';
import { calcInputPos } from './calc-input-pos';
import { createInput } from './create-input';
import { filterInput } from './filter-input';

export const createInputManager = (inputMap: InputMap, view: EditorView, utils: Utils) => {
    let inputCommand: Event2Command | undefined;
    const setCommand = (x?: Event2Command) => (inputCommand = x);

    const wrapper = view.dom.parentNode;
    if (!wrapper) throw new Error();

    const [input, button] = createInput(utils);
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
