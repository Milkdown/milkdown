/* Copyright 2021, Milkdown by Mirone. */
import { Utils } from '@milkdown/utils';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { createButtonManager } from './button-manager';
import { createInputManager } from './input-manager';
import type { ButtonMap, InputMap } from './item';

export const createPlugin = (buttonMap: ButtonMap, inputMap: InputMap, view: EditorView, utils: Utils) => {
    const buttonManager = createButtonManager(buttonMap, view, utils);
    const inputManager = createInputManager(inputMap, view, utils);

    const hide = () => {
        buttonManager.hide();
        inputManager.hide();
    };

    const update = (view: EditorView, prevState?: EditorState) => {
        const { state } = view;

        if (!view.editable || state.selection.empty) {
            hide();
            return;
        }

        const isEqualSelection = prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection);
        if (isEqualSelection) return;

        buttonManager.update(view);
        inputManager.update(view);
    };

    update(view);

    return {
        update,
        destroy: () => {
            buttonManager.destroy();
            inputManager.destroy();
        },
    };
};
