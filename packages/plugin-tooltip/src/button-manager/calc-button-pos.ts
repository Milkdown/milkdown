/* Copyright 2021, Milkdown by Mirone. */
import { calculateTextPosition, EditorView } from '@milkdown/prose';

export const calcButtonPos = (buttons: HTMLElement, view: EditorView, isFixed = false) => {
    buttons.classList.remove('hide');
    calculateTextPosition(view, buttons, (start, end, target, parent) => {
        if (!isFixed) {
            const selectionWidth = end.left - start.left;
            let left = start.left - parent.left - (target.width - selectionWidth) / 2;
            const top = start.top - parent.top - target.height - 14;

            if (left < 0) left = 0;

            return [top, left];
        } else {
            const between = (num: number, min: number, max: number) => (num > max ? max : num < min ? min : num);
            const selectionWidth = end.left - start.left;
            const top = start.top - target.height - 14;
            const left = start.left - (target.width - selectionWidth) / 2;
            const _left = between(left, 0, window.innerWidth);
            const _top = top > 0 ? top : start.bottom + 14;
            return [_top, _left];
        }
    });
};
