/* Copyright 2021, Milkdown by Mirone. */
import { injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';

import { code, typography } from './font';
import { mixin } from './mixin';
import { color } from './nord';
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

export const nord = themeFactory({
    font,
    size,
    color,
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

export { mixin } from './mixin';
export { color } from './nord';
export { override } from './override';
export { slots } from './slots';
export { view } from './view';
