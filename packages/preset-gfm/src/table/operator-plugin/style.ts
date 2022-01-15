/* Copyright 2021, Milkdown by Mirone. */
import { Emotion, ThemeTool } from '@milkdown/core';

export const injectStyle = ({ size, mixin, palette }: ThemeTool, { css }: Emotion) => css`
    display: inline-flex;
    cursor: pointer;
    z-index: 2;

    justify-content: space-evenly;

    position: absolute;

    border-radius: ${size.radius};

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
            right: 0px;
            top: 0;
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
