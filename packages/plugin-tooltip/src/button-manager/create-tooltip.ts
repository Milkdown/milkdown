import type { Ctx } from '@milkdown/core';
import type { EditorView } from 'prosemirror-view';

import type { ButtonMap } from '../item';
import { injectStyle } from './style';

export const createTooltip = (buttonMap: ButtonMap, view: EditorView, ctx: Ctx) => {
    const div = document.createElement('div');
    const style = injectStyle(ctx);

    div.classList.add('tooltip', style);
    Object.values(buttonMap)
        .filter((item) => item.enable(view))
        .forEach(({ $ }) => div.appendChild($));

    view.dom.parentNode?.appendChild(div);

    return div;
};
