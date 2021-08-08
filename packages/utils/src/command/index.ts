import { Cmd } from '@milkdown/core';
import { Node as ProseNode } from 'prosemirror-model';
import { NodeSelection, TextSelection } from 'prosemirror-state';

type SelectType = 'node' | 'text';
type Options = Partial<{
    factory: () => ProseNode;
    type: SelectType;
}>;

export const getDepth = (node: ProseNode) => {
    let cur = node;
    let depth = 0;
    while (cur.childCount) {
        cur = cur.child(0);
        depth += 1;
    }

    return depth;
};

export const cleanUpAndCreateNode: Cmd<Options> =
    (options = {}) =>
    (state, dispatch) => {
        const { factory, type = 'text' } = options;
        if (!dispatch || !factory) return false;

        const { selection } = state;
        const { $head } = selection;
        const node = factory();

        const tr = state.tr.replaceWith($head.before(), $head.pos, node);
        const depth = getDepth(node);
        const sel =
            type === 'node'
                ? NodeSelection.create(tr.doc, $head.before() + depth)
                : TextSelection.create(tr.doc, $head.start() + depth);

        dispatch(tr.setSelection(sel).scrollIntoView());
        return true;
    };
