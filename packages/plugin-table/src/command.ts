/* Copyright 2021, Milkdown by Mirone. */
import { Command, isInTable, Node, NodeType, Selection } from '@milkdown/prose';

export const exitTable =
    (node: NodeType): Command =>
    (state, dispatch) => {
        if (!isInTable(state)) {
            return false;
        }
        const { $head } = state.selection;
        const pos = $head.after();
        const tr = state.tr.replaceWith(pos, pos, node.createAndFill() as Node);
        tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
        dispatch?.(tr.scrollIntoView());
        return true;
    };
