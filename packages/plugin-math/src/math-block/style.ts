/* Copyright 2021, Milkdown by Mirone. */

import { Color, ThemeColor, ThemeFont, ThemeSize } from '@milkdown/core';
import { Utils } from '@milkdown/utils';

export const getStyle = (utils: Utils) => {
    const codeStyle = utils.getStyle((themeManager, { css }) => {
        const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
        const radius = themeManager.get(ThemeSize, 'radius');
        const code = themeManager.get(ThemeFont, 'code');
        return css`
            color: ${palette('neutral', 0.87)};
            background-color: ${palette('background')};
            border-radius: ${radius};
            padding: 1rem 2rem;
            font-size: 0.875rem;
            font-family: ${code};
            overflow: hidden;
            .ProseMirror {
                outline: none;
            }
        `;
    });
    const hideCodeStyle = utils.getStyle(
        (_, { css }) => css`
            display: none;
        `,
    );
    const previewPanelStyle = utils.getStyle(
        (_, { css }) => css`
            display: flex;
            justify-content: center;
            padding: 1rem 0;
        `,
    );

    return {
        codeStyle,
        hideCodeStyle,
        previewPanelStyle,
    };
};
