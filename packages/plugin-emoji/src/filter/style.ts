/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
import type { ThemeTool } from '@milkdown/core';

export const injectStyle = ({ size, mixin, palette, font }: ThemeTool) => {
    return css`
        position: absolute;
        &.hide {
            display: none;
        }

        ${mixin.border?.()};
        border-radius: ${size.radius};
        background: ${palette('surface')};
        ${mixin.shadow?.()};

        .milkdown-emoji-filter_item {
            display: flex;
            gap: 0.5rem;
            height: 2.25rem;
            padding: 0 1rem;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 2;
            font-family: ${font.typography};
            font-size: 0.875rem;
            &.active {
                background: ${palette('secondary', 0.12)};
                color: ${palette('primary')};
            }
        }

        .emoji {
            height: 1em;
            width: 1em;
            margin: 0 0.05em 0 0.1em;
            vertical-align: -0.1em;
        }
    `;
};
