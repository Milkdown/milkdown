/* Copyright 2021, Milkdown by Mirone. */

import { ResolvedPos } from '@milkdown/prose/model';
import { EditorView } from '@milkdown/prose/view';

export const getDOMByPos = (view: EditorView, root: HTMLElement, $pos: ResolvedPos) => {
    const { node } = view.domAtPos($pos.pos);

    let el: HTMLElement = node as HTMLElement;
    let parent = el.parentElement;
    while (parent && parent !== root && $pos.pos === view.posAtDOM(parent, 0)) {
        el = parent;
        parent = parent.parentElement;
    }

    return el;
};
