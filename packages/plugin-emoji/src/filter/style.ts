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

export const injectStyle = (themeManager: ThemeManager, { css, cx }: Emotion) => {
    const border = themeManager.get(ThemeBorder, undefined);
    const shadow = themeManager.get(ThemeShadow, undefined);
    const scrollbar = themeManager.get(ThemeScrollbar, undefined);
    const radius = themeManager.get(ThemeSize, 'radius');
    const typography = themeManager.get(ThemeFont, 'typography');
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);

    const style = css`
        min-height: 36px;
        max-height: 320px;
        overflow-y: auto;
        border-radius: ${radius};
        position: absolute;
        background: ${palette('surface')};

        &.hide {
            display: none;
        }

        .milkdown-emoji-filter_item {
            display: flex;
            gap: 8px;
            height: 36px;
            padding: 0 14px;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 2;
            font-family: ${typography};
            font-size: 14px;
            &.active {
                background: ${palette('secondary', 0.12)};
                color: ${palette('primary')};
            }
        }

        .emoji {
            height: 14px;
            width: 14px;
            margin: 0 1px 0 1.5px;
            vertical-align: -1.5px;
        }
    `;
    return cx(border, shadow, scrollbar, style);
};
