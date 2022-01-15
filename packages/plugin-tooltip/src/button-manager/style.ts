/* Copyright 2021, Milkdown by Mirone. */
import { Emotion, ThemeTool } from '@milkdown/core';

export const injectStyle = (themeTool: ThemeTool, { css }: Emotion) => {
    const { palette, mixin, size } = themeTool;
    return css`
        display: inline-flex;
        cursor: pointer;
        justify-content: space-evenly;
        position: absolute;
        border-radius: ${size.radius};
        z-index: 2;

        ${mixin.border?.()};
        ${mixin.shadow?.()};

        overflow: hidden;
        background: ${palette('surface')};

        .icon {
            position: relative;
            color: ${palette('solid', 0.87)};

            width: 3rem;
            line-height: 3rem;
            text-align: center;
            transition: all 0.4s ease-in-out;
            &:hover {
                background-color: ${palette('secondary', 0.12)};
            }
            &.active {
                color: ${palette('primary')};
            }
            &:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 0;
                right: calc(-0.5 * ${size.lineWidth});
                width: ${size.lineWidth};
                bottom: 0;
                background: ${palette('line')};
            }
        }
        &.hide,
        .hide {
            display: none;
        }
    `;
};
