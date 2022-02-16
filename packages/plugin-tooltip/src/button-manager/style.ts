/* Copyright 2021, Milkdown by Mirone. */
import { Color, Emotion, ThemeBorder, ThemeColor, ThemeManager, ThemeShadow, ThemeSize } from '@milkdown/core';

export const injectStyle = (themeManager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
    const lineWidth = themeManager.get(ThemeSize, 'lineWidth');
    return css`
        display: inline-flex;
        cursor: pointer;
        justify-content: space-evenly;
        position: absolute;
        border-radius: ${themeManager.get(ThemeSize, 'radius')};
        z-index: 2;

        ${themeManager.get(ThemeBorder, undefined)}
        ${themeManager.get(ThemeShadow, undefined)}

        overflow: hidden;
        background: ${palette('surface')};

        .icon {
            position: relative;
            color: ${palette('solid', 0.87)};

            width: 2em;
            line-height: 2em;
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
                right: calc(-0.5 * ${lineWidth});
                width: ${lineWidth};
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
