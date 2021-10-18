/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose';
import type { Utils } from '@milkdown/utils';

import type { ButtonMap } from '../item';
import { injectStyle } from './style';

type Tooltip = {
    dom: HTMLDivElement;
    render: (editorView: EditorView) => void;
};

export const createTooltip = (buttonMap: ButtonMap, utils: Utils): Tooltip => {
    const div = document.createElement('div');
    const style = utils.getStyle(injectStyle) || '';
    if (style) {
        div.classList.add(style);
    }

    div.classList.add('tooltip');

    return {
        dom: div,
        render: (editorView: EditorView) => {
            Object.values(buttonMap)
                .filter((item) => item.enable(editorView))
                .forEach(({ $ }) => div.appendChild($));

            editorView.dom.parentNode?.appendChild(div);
        },
    };
};
