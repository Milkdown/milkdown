/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';
import type { Utils } from '@milkdown/utils';

import type { ButtonMap } from '../item';
import { calcButtonPos } from './calc-button-pos';
import { createTooltip } from './create-tooltip';
import { filterButton } from './filter-button';

export const createButtonManager = (buttonMap: ButtonMap, utils: Utils) => {
    const { dom: buttons, render } = createTooltip(buttonMap, utils);

    const onClick = (e: Event) => {
        const target = Object.values(buttonMap).find(({ $ }) => e.target instanceof Element && $.contains(e.target));
        if (!target) return;

        e.stopPropagation();
        e.preventDefault();
        target.command();
    };

    const hide = () => {
        buttons.classList.add('hide');
    };

    buttons.addEventListener('mousedown', onClick);

    return {
        destroy: () => {
            buttons.removeEventListener('mousedown', onClick);
            buttons.remove();
        },
        hide,
        update: (editorView: EditorView) => {
            const noActive = filterButton(buttonMap, editorView);
            if (noActive) {
                hide();
                return;
            }
            calcButtonPos(buttons, editorView);
        },
        render,
    };
};
