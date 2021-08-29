/* Copyright 2021, Milkdown by Mirone. */
import { injectGlobal } from '@emotion/css';
import { themeFactory } from '@milkdown/core';

import { font, fontCode } from './font';
import { mixin } from './mixin';
import { color } from './nord';
import { view } from './view';

export const nord = themeFactory({
    font: {
        font,
        fontCode,
    },
    size: {
        radius: '4px',
        lineWidth: '1px',
    },
    color,
    mixin: mixin,
    global: ({ palette, font, mixin, size }) => {
        const css = injectGlobal;
        css`
            ${view};
            .milkdown {
                color: ${palette('neutral', 0.87)};
                background: ${palette('surface')};

                position: relative;
                font-family: ${font.font};
                margin-left: auto;
                margin-right: auto;
                ${mixin.shadow?.()};
                padding: 3.125rem 1.25rem;
                box-sizing: border-box;

                .editor {
                    outline: none;
                    & > * {
                        margin: 1.875rem 0;
                    }
                }

                .ProseMirror-selectednode {
                    outline: ${size.lineWidth} solid ${palette('line')};
                }

                li.ProseMirror-selectednode {
                    outline: none;
                }

                li.ProseMirror-selectednode::after {
                    ${mixin.border?.()};
                }

                @media only screen and (min-width: 72rem) {
                    max-width: 57.375rem;
                    padding: 3.125rem 7.25rem;
                }

                & ::selection {
                    background: ${palette('secondary', 0.38)};
                }
            }
        `;
    },
});
