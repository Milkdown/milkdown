/* Copyright 2021, Milkdown by Mirone. */
import { Node, NodeType } from '@milkdown/prose/model';
import { Command, Selection } from '@milkdown/prose/state';

import { isInTable } from './plugin/util';

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
