/* Copyright 2021, Milkdown by Mirone. */
import { EditorView } from '@milkdown/prose/view';

export const removePossibleTable = (view: EditorView) => {
    const { state, dispatch } = view;

    const $pos = state.selection.$anchor;
    for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (node.type.spec['tableRole'] == 'table') {
            dispatch(state.tr.delete($pos.before(d), $pos.after(d)).scrollIntoView());
        }
    }
};
