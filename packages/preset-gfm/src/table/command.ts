/* Copyright 2021, Milkdown by Mirone. */
import { Command } from '@milkdown/prose/commands';
import { Node, NodeType } from '@milkdown/prose/model';
import { Selection } from '@milkdown/prose/state';
import { isInTable } from '@milkdown/prose/tables';

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
