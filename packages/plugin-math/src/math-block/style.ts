/* Copyright 2021, Milkdown by Mirone. */

import { Utils } from '@milkdown/utils';

export const getStyle = (utils: Utils) => {
    const codeStyle = utils.getStyle(
        ({ palette, size, font }, { css }) => css`
            color: ${palette('neutral', 0.87)};
            background-color: ${palette('background')};
            border-radius: ${size.radius};
            padding: 1rem 2rem;
            font-size: 0.875rem;
            font-family: ${font.code};
            overflow: hidden;
            .ProseMirror {
                outline: none;
            }
        `,
    );
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
