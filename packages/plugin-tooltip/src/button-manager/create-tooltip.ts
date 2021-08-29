/* Copyright 2021, Milkdown by Mirone. */
import type { Utils } from '@milkdown/utils';
import type { EditorView } from 'prosemirror-view';

import type { ButtonMap } from '../item';
import { injectStyle } from './style';

export const createTooltip = (buttonMap: ButtonMap, view: EditorView, utils: Utils) => {
    const div = document.createElement('div');
    const style = utils.getStyle(injectStyle) || '';
    if (style) {
        div.classList.add(style);
    }

    div.classList.add('tooltip');
    Object.values(buttonMap)
        .filter((item) => item.enable(view))
        .forEach(({ $ }) => div.appendChild($));

    view.dom.parentNode?.appendChild(div);

    return div;
};
