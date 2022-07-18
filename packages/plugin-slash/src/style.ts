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
            gap: 32px;
            height: 48px;
            padding: 0 16px;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 48px;
            font-family: ${themeManager.get(ThemeFont, 'typography')};
            font-size: 14px;

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
        width: 320px;
        max-height: 320px;
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
