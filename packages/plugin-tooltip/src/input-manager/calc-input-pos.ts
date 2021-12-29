/* Copyright 2021, Milkdown by Mirone. */
import { calculateTextPosition, EditorView } from '@milkdown/prose';

export const calcInputPos = (view: EditorView, input: HTMLDivElement) => {
    calculateTextPosition(view, input, (start, end, target, parent) => {
        const $editor = input.parentElement;
        if (!$editor) {
            throw new Error();
        }

        const selectionWidth = end.left - start.left;
        let left = start.left - parent.left - (target.width - selectionWidth) / 2;
        const top = start.bottom - parent.top + 14 + $editor.scrollTop;

        if (left < 0) left = 0;

        return [top, left];
    });
};
