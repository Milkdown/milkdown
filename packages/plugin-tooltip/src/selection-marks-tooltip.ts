import { Ctx } from '@milkdown/core';
import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ButtonManager } from './button-manager';
import { InputManager } from './input-manager';
import type { ButtonMap, InputMap } from './item';

export class SelectionMarksTooltip {
    #buttonManager: ButtonManager;
    #inputManager: InputManager;

    constructor(buttonMap: ButtonMap, inputMap: InputMap, view: EditorView, ctx: Ctx) {
        this.#buttonManager = new ButtonManager(buttonMap, view, ctx);
        this.#inputManager = new InputManager(inputMap, view, ctx);
        this.update(view);
    }

    update(view: EditorView, prevState?: EditorState) {
        if (!view.editable) {
            this.hide();
            return;
        }

        const state = view.state;

        if (state.selection.empty) {
            this.hide();
            return;
        }

        const isEqualSelection = prevState?.doc.eq(state.doc) && prevState.selection.eq(state.selection);
        if (isEqualSelection) return;

        this.#buttonManager.update(view);
        this.#inputManager.update(view);
    }

    destroy() {
        this.#buttonManager.destroy();
        this.#inputManager.destroy();
    }

    private hide() {
        this.#buttonManager.hide();
        this.#inputManager.hide();
    }
}
