/* Copyright 2021, Milkdown by Mirone. */

import { Utils } from '@milkdown/utils';

export type DividerConfig = {
    type: 'divider';
    group: HTMLElement[];
};
export const divider = (utils: Utils) => {
    const dividerStyle = utils.getStyle((themeTool, { css }) => {
        return css`
            flex-shrink: 0;
            width: ${themeTool.size.lineWidth};
            background-color: ${themeTool.palette('line')};
            margin: 0.75rem 1rem;
        `;
    });
    const $divider = document.createElement('div');
    $divider.classList.add('divider');
    if (dividerStyle) {
        $divider.classList.add(dividerStyle);
    }
    return $divider;
};
