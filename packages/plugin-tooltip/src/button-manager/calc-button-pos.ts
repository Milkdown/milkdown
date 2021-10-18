/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';
import { calculateTextPosition } from '@milkdown/utils';

export const calcButtonPos = (buttons: HTMLElement, view: EditorView) => {
    buttons.classList.remove('hide');
    calculateTextPosition(view, buttons, (start, end, target, parent) => {
        const selectionWidth = end.left - start.left;
        let left = start.left - parent.left - (target.width - selectionWidth) / 2;
        const top = start.top - parent.top - target.height - 14;

        if (left < 0) left = 0;

        return [top, left];
    });
};
