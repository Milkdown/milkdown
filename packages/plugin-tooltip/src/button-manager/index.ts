/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose/view';
import type { Utils } from '@milkdown/utils';

import type { ButtonList } from '../item';
import { calcButtonPos } from './calc-button-pos';
import { createTooltip } from './create-tooltip';
import { filterButton } from './filter-button';

export const createButtonManager = (buttons: ButtonList, utils: Utils, bottom: boolean, containerClassName: string) => {
    const { dom: buttonDOM, render } = createTooltip(buttons, utils, containerClassName);

    const onClick = (e: Event) => {
        const target = buttons.find(({ $ }) => e.target instanceof Element && $.contains(e.target));
        if (!target) return;

        e.stopPropagation();
        e.preventDefault();
        target.command();
    };

    const hide = () => {
        buttonDOM.classList.add('hide');
    };

    buttonDOM.addEventListener('mousedown', onClick);

    return {
        destroy: () => {
            buttonDOM.removeEventListener('mousedown', onClick);
            buttonDOM.remove();
        },
        hide,
        update: (editorView: EditorView) => {
            const noActive = filterButton(buttons, editorView);
            if (noActive) {
                hide();
                return;
            }
            calcButtonPos(buttonDOM, editorView, bottom);
        },
        render,
    };
};
