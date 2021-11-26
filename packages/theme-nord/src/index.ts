/* Copyright 2021, Milkdown by Mirone. */
import { injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';

import { code, typography } from './font';
import { mixin } from './mixin';
import { darkColor, lightColor } from './nord';
import { override } from './override';
import { slots } from './slots';
import { view } from './view';

export const font = {
    typography,
    code,
};

export const size = {
    radius: '4px',
    lineWidth: '1px',
};

export const nordLight = themeFactory({
    font,
    size,
    color: lightColor,
    mixin,
    slots,
    global: (themeTool) => {
        const css = injectGlobal;
        css`
            ${view};
            ${override(themeTool)}
        `;
    },
});

export const nordDark = themeFactory({
    font,
    size,
    color: darkColor,
    mixin,
    slots,
    global: (themeTool) => {
        const css = injectGlobal;
        css`
            ${view};
            ${override(themeTool)}
        `;
    },
});

const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
export const nord = darkMode ? nordDark : nordLight;

export { mixin } from './mixin';
export { color, darkColor, lightColor } from './nord';
export { override } from './override';
export { slots } from './slots';
export { view } from './view';
