/* Copyright 2021, Milkdown by Mirone. */

import { css } from '@emotion/css';
import { ThemeTool } from '@milkdown/design-system';

export const override = ({ palette, mixin, size, font }: ThemeTool) => css`
    .milkdown {
        color: ${palette('neutral', 0.87)};
        background: ${palette('surface')};

        position: relative;
        font-family: ${font.typography};
        margin-left: auto;
        margin-right: auto;
        ${mixin.shadow?.()};
        box-sizing: border-box;
        ${mixin.scrollbar?.()};

        .editor {
            padding: 3.125rem 1.25rem;
            outline: none;
            & > * {
                margin: 1.875rem 0;
            }

            @media only screen and (min-width: 72rem) {
                max-width: 57.375rem;
                padding: 3.125rem 7.25rem;
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

        & ::selection {
            background: ${palette('secondary', 0.38)};
        }
    }
`;
