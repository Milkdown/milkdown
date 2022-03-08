/* Copyright 2021, Milkdown by Mirone. */
import type { EditorState, EditorView } from '@milkdown/prose';
import { Utils } from '@milkdown/utils';

import { createButtonManager } from './button-manager';
import type { ButtonMap } from './item';

export const createPlugin = (buttonMap: ButtonMap, utils: Utils, bottom: boolean) => {
    const buttonManager = createButtonManager(buttonMap, utils, bottom);
    // const inputManager = createInputManager(inputMap, utils);
    let shouldHide = false;

    const hide = () => {
        buttonManager.hide();
        // inputManager.hide();
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
    };

    return {
        update,
        destroy: () => {
            buttonManager.destroy();
        },
        render: (editorView: EditorView) => {
            buttonManager.render(editorView);
            update(editorView);
        },
        setHide: (isTyping: boolean) => {
            shouldHide = isTyping;
        },
    };
};
