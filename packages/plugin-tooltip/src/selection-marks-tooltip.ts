import { Ctx } from '@milkdown/core';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { createButtonManager } from './button-manager';
import { createInputManager } from './input-manager';
import type { ButtonMap, InputMap } from './item';

export const createPlugin = (buttonMap: ButtonMap, inputMap: InputMap, view: EditorView, ctx: Ctx) => {
    const buttonManager = createButtonManager(buttonMap, view, ctx);
    const inputManager = createInputManager(inputMap, view, ctx);

    const hide = () => {
        buttonManager.hide();
        inputManager.hide();
    };

    const update = (view: EditorView, prevState?: EditorState) => {
        if (!view.editable) {
            hide();
            return;
        }

        const state = view.state;

        if (state.selection.empty) {
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
