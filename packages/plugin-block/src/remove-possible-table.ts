/* Copyright 2021, Milkdown by Mirone. */
import { Transaction } from '@milkdown/prose/state';
import { dropPoint } from '@milkdown/prose/transform';
import { EditorView } from '@milkdown/prose/view';

export const removePossibleTable = (view: EditorView, event: DragEvent): Transaction | null => {
    const { state } = view;

    const $pos = state.selection.$anchor;
    for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d);
        if (node.type.spec['tableRole'] == 'table') {
            const eventPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (!eventPos) return null;
            const slice = view.dragging?.slice;
            if (!slice) return null;

            const $mouse = view.state.doc.resolve(eventPos.pos);
            const insertPos = dropPoint(view.state.doc, $mouse.pos, slice);
            if (!insertPos) return null;

            let tr = state.tr;
            tr = tr.delete($pos.before(d), $pos.after(d));

            const pos = tr.mapping.map(insertPos);

            tr = tr.replaceRange(pos, pos, slice).scrollIntoView();

            return tr;
        }
    }

    return null;
};
