/* Copyright 2021, Milkdown by Mirone. */

import { Utils } from '@milkdown/utils';

import { tryRgbToHex } from './utility';

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
    const mermaidVariables = () => {
        const styleRoot = getComputedStyle(document.documentElement);
        const getColor = (v: string) => tryRgbToHex(styleRoot.getPropertyValue('--' + v));
        const line = getColor('line');
        const solid = getColor('solid');
        const neutral = getColor('neutral');
        const background = getColor('background');
        const style = {
            background,
            primaryColor: background,
            secondaryColor: line,
            primaryTextColor: neutral,
            noteBkgColor: background,
            noteTextColor: solid,
        };
        return Object.entries(style)
            .filter(([_, value]) => value.length > 0)
            .map(([key, value]) => `'${key}':'${value}'`)
            .join(', ');
    };

    return {
        codeStyle,
        hideCodeStyle,
        previewPanelStyle,
        mermaidVariables,
    };
};
