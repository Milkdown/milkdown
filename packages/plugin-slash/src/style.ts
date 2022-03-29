/* Copyright 2021, Milkdown by Mirone. */
import {
    Color,
    Emotion,
    ThemeBorder,
    ThemeColor,
    ThemeFont,
    ThemeManager,
    ThemeScrollbar,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';

const itemStyle = (themeManager: ThemeManager, { css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
    return css`
        .slash-dropdown-item {
            display: flex;
            gap: 2em;
            height: 3.4286em;
            padding: 0 1em;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 3.4286em;
            font-family: ${themeManager.get(ThemeFont, 'typography')};
            font-size: 0.875em;

            transition: all 0.2s ease-in-out;

            &,
            .icon {
                color: ${palette('neutral', 0.87)};
                transition: all 0.2s ease-in-out;
            }

            &.hide {
                display: none;
            }

            &.active {
                background: ${palette('secondary', 0.12)};
                &,
                .icon {
                    color: ${palette('primary')};
                }
            }
        }
    `;
};

export const injectStyle = (themeManager: ThemeManager, emotion: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);

    return emotion.css`
        width: 20.5em;
        max-height: 20.5em;
        overflow-y: auto;
        border-radius: ${themeManager.get(ThemeSize, 'radius')};
        position: absolute;
        background: ${palette('surface')};

        ${themeManager.get(ThemeBorder, undefined)}
        ${themeManager.get(ThemeShadow, undefined)}
        ${themeManager.get(ThemeScrollbar, undefined)}

        &.hide {
            display: none;
        }

        ${itemStyle(themeManager, emotion)}
    `;
};
