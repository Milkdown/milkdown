/* Copyright 2021, Milkdown by Mirone. */
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

export const nordLight = themeFactory((emotion) => ({
    font,
    size,
    slots,
    color: lightColor,
    mixin: mixin(emotion),
    global: (themeTool) => {
        const css = emotion.injectGlobal;
        css`
            ${view(emotion)};
            ${override(emotion)(themeTool)}
        `;
    },
}));

export const nordDark = themeFactory((emotion) => ({
    font,
    size,
    slots,
    color: darkColor,
    mixin: mixin(emotion),
    global: (themeTool) => {
        const css = emotion.injectGlobal;
        css`
            ${view(emotion)};
            ${override(emotion)(themeTool)}
        `;
    },
}));

const darkMode = Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
export const nord = darkMode ? nordDark : nordLight;

export { mixin } from './mixin';
export { color, darkColor, lightColor } from './nord';
export { override } from './override';
export { slots } from './slots';
export { view } from './view';
