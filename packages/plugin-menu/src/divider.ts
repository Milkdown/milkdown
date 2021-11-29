/* Copyright 2021, Milkdown by Mirone. */

import { css } from '@emotion/css';
import { Utils } from '@milkdown/utils';

export type DividerConfig = {
    type: 'divider';
    group: HTMLElement[];
};
export const divider = (utils: Utils) => {
    const dividerStyle = utils.getStyle((themeTool) => {
        return css`
            flex-shrink: 0;
            width: ${themeTool.size.lineWidth};
            background-color: ${themeTool.palette('line')};
            margin: 0.75rem 1rem;
        `;
    });
    const $divider = document.createElement('div');
    if (dividerStyle) {
        $divider.classList.add(dividerStyle);
    }
    return $divider;
};
