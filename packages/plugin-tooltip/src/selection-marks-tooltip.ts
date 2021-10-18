/* Copyright 2021, Milkdown by Mirone. */
import type { EditorState, EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { createButtonManager } from './button-manager';
import { createInputManager } from './input-manager';
import type { ButtonMap, InputMap } from './item';

export const createPlugin = (buttonMap: ButtonMap, inputMap: InputMap, utils: Utils) => {
    const buttonManager = createButtonManager(buttonMap, utils);
    const inputManager = createInputManager(inputMap, utils);
    let shouldHide = false;

    const hide = () => {
        buttonManager.hide();
        inputManager.hide();
    };

    const update = (view: EditorView, prevState?: EditorState) => {
        const { state } = view;

        if (!view.editable || shouldHide) {
            hide();
            return;
        }

        const isEqualSelection = prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection);
        if (isEqualSelection) return;

        buttonManager.update(view);
        inputManager.update(view);
    };

    return {
        update,
        destroy: () => {
            buttonManager.destroy();
            inputManager.destroy();
        },
        render: (editorView: EditorView) => {
            buttonManager.render(editorView);
            inputManager.render(editorView);
            update(editorView);
        },
        setHide: (isTyping: boolean) => {
            shouldHide = isTyping;
        },
    };
};
