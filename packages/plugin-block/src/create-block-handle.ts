/* Copyright 2021, Milkdown by Mirone. */

import { getPalette, ThemeIcon } from '@milkdown/core';
import { Utils } from '@milkdown/utils';

export const createBlockHandle = ({ themeManager, getStyle }: Utils) => {
    const dom = document.createElement('div');
    dom.draggable = true;
    const icon = themeManager.get(ThemeIcon, 'dragHandle');

    dom.appendChild(icon.dom);
    themeManager.onFlush(() => {
        if (!dom) return;

        const style = getStyle(({ css }) => {
            const palette = getPalette(themeManager);
            return css`
                position: absolute;
                color: ${palette('solid')};
                cursor: grab;
                padding: 0 4px;
                &:hover {
                    color: ${palette('primary')};
                }
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
