/* Copyright 2021, Milkdown by Mirone. */

import { ThemeColor, ThemeSize } from '@milkdown/core';
import { Utils } from '@milkdown/utils';

export type DividerConfig = {
    type: 'divider';
    group: HTMLElement[];
};
export const divider = (utils: Utils) => {
    const $divider = document.createElement('div');
    $divider.classList.add('divider');
    const { themeManager } = utils;
    themeManager.onFlush(() => {
        const dividerStyle = utils.getStyle(({ css }) => {
            return css`
                flex-shrink: 0;
                width: ${themeManager.get(ThemeSize, 'lineWidth')};
                background-color: ${themeManager.get(ThemeColor, ['line'])};
                margin: 0.75em 1em;
                min-height: 1.5em;
            `;
        });
        if (dividerStyle) {
            $divider.classList.add(dividerStyle);
        }
    });
    return $divider;
};
