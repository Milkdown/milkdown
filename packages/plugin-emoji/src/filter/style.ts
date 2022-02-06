/* Copyright 2021, Milkdown by Mirone. */
import {
    Color,
    Emotion,
    ThemeBorder,
    ThemeColor,
    ThemeFont,
    ThemeManager,
    ThemeShadow,
    ThemeSize,
} from '@milkdown/core';

export const injectStyle = (themeManager: ThemeManager, { css, cx }: Emotion) => {
    const border = themeManager.get(ThemeBorder);
    const shadow = themeManager.get(ThemeShadow);
    const radius = themeManager.get(ThemeSize, 'radius');
    const typography = themeManager.get(ThemeFont, 'typography');
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);

    const style = css`
        position: absolute;
        &.hide {
            display: none;
        }

        border-radius: ${radius};
        background: ${palette('surface')};

        .milkdown-emoji-filter_item {
            display: flex;
            gap: 0.5rem;
            height: 2.25rem;
            padding: 0 1rem;
            align-items: center;
            justify-content: flex-start;
            cursor: pointer;
            line-height: 2;
            font-family: ${typography};
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
    return cx(border, shadow, style);
};
