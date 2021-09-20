/* Copyright 2021, Milkdown by Mirone. */

import { Node } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export const createInnerEditor = () => {
    let isEditing = false;
    let innerView: EditorView | undefined;

    const openEditor = ($: HTMLElement, doc: Node) => {
        innerView = new EditorView($, {
            state: EditorState.create({ doc }),
        });
        innerView.focus();
        const { state } = innerView;
        innerView.dispatch(state.tr.setSelection(TextSelection.create(state.doc, 0)));
        isEditing = true;
    };

    const closeEditor = () => {
        if (innerView) {
            innerView.destroy();
        }
        innerView = undefined;
        isEditing = false;
    };

    return {
        isEditing: () => isEditing,
        innerView: () => innerView,
        openEditor,
        closeEditor,
    };
};
