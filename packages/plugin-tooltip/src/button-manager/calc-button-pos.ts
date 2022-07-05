/* Copyright 2021, Milkdown by Mirone. */
import { missingRootElement } from '@milkdown/exception';
import { calculateTextPosition } from '@milkdown/prose';
import { EditorView } from '@milkdown/prose/view';

export const calcButtonPos = (buttons: HTMLElement, view: EditorView, isBottom: boolean) => {
    buttons.classList.remove('hide');
    calculateTextPosition(view, buttons, (start, end, target, parent) => {
        const $editor = buttons.parentElement;
        if (!$editor) {
            throw missingRootElement();
        }
        const selectionWidth = end.left - start.left;
        let left = start.left - parent.left - (target.width - selectionWidth) / 2;
        let top = start.top - parent.top - target.height - 14 + $editor.scrollTop;

        if (left < 0) left = 0;

        if (start.top - parent.top < target.height || (isBottom && parent.bottom - start.bottom > target.height)) {
            top = start.bottom - parent.top + 14 + $editor.scrollTop;
        }
        return [top, left];
    });
};
