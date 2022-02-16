/* Copyright 2021, Milkdown by Mirone. */
import { Color, Emotion, ThemeBorder, ThemeColor, ThemeManager, ThemeShadow, ThemeSize } from '@milkdown/core';

export const injectStyle = (themeManager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);

    return css`
        ${themeManager.get(ThemeBorder, undefined)}
        ${themeManager.get(ThemeShadow, undefined)}

        display: inline-flex;
        justify-content: space-between;
        align-items: center;
        position: absolute;
        background: ${palette('surface')};
        border-radius: ${themeManager.get(ThemeSize, 'radius')};
        font-size: 1em;

        height: 3.5em;
        box-sizing: border-box;
        width: 25.5em;
        padding: 0 1em;
        gap: 1em;
        z-index: 2;

        input,
        button {
            all: unset;
        }

        input {
            flex-grow: 1;
            caret-color: ${palette('primary')};
            &::placeholder {
                color: ${palette('neutral', 0.6)};
            }
        }

        button {
            cursor: pointer;
            height: 2.25em;
            color: ${palette('primary')};
            font-size: 14px;
            padding: 0 0.5em;
            font-weight: 500;
            letter-spacing: 1.25px;
            &:hover {
                background-color: ${palette('secondary', 0.12)};
            }
            &.disable {
                color: ${palette('neutral', 0.38)};
                cursor: not-allowed;
                &:hover {
                    background: transparent;
                }
            }
            &.hide {
                display: none;
            }
        }

        &.hide {
            display: none;
        }
    `;
};
