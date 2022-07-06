/* Copyright 2021, Milkdown by Mirone. */
import type { EditorView } from '@milkdown/prose/view';
import type { Utils } from '@milkdown/utils';

import type { ButtonList } from '../item';
import { injectStyle } from './style';

type Tooltip = {
    dom: HTMLDivElement;
    render: (editorView: EditorView) => void;
};

export const createTooltip = (buttonMap: ButtonList, utils: Utils, className: string): Tooltip => {
    const div = document.createElement('div');
    utils.themeManager.onFlush(() => {
        const style = utils.getStyle((emotion) => injectStyle(utils.themeManager, emotion)) || '';
        if (style) {
            div.classList.add(style);
        }
    });

    div.classList.add(utils.getClassName({}, className));

    return {
        dom: div,
        render: (editorView: EditorView) => {
            buttonMap
                .filter((item) => item.enable(editorView) && item.$ != null)
                .forEach(({ $ }) => div.appendChild($));

            editorView.dom.parentNode?.appendChild(div);
        },
    };
};
