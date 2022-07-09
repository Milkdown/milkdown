/* Copyright 2021, Milkdown by Mirone. */

import { ThemeIcon } from '@milkdown/core';
import { Utils } from '@milkdown/utils';

export const createBlockHandle = ({ themeManager, getStyle }: Utils) => {
    const dom = document.createElement('div');
    dom.draggable = true;
    const icon = themeManager.get(ThemeIcon, 'dragHandle');

    dom.appendChild(icon.dom);
    themeManager.onFlush(() => {
        if (!dom) return;

        const style = getStyle(({ css }) => {
            return css`
                position: absolute;
                &.hide {
                    display: none;
                }
            `;
        });

        if (style) {
            const className = ['block-handle', style, 'hide'].filter((x): x is string => x != null).join(' ');
            dom.className = className;
        }
    });

    return dom;
};
