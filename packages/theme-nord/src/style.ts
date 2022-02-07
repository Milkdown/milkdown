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

export const getStyle = (manager: ThemeManager, { injectGlobal, css }: Emotion) => {
    const palette = (color: Color, opacity = 1) => manager.get(ThemeColor, [color, opacity]);
    const radius = manager.get(ThemeSize, 'radius');
    const neutral = palette('neutral', 0.87);
    const surface = palette('surface');
    const line = palette('line');
    const highlight = palette('secondary', 0.38);

    const selection = css`
        .ProseMirror-selectednode {
            outline: ${manager.get(ThemeSize, 'lineWidth')} solid ${line};
        }

        li.ProseMirror-selectednode {
            outline: none;
        }

        li.ProseMirror-selectednode::after {
            ${manager.get(ThemeBorder, undefined)};
        }

        & ::selection {
            background: ${highlight};
        }
    `;

    const editorLayout = css`
        padding: 3.125rem 1.25rem;
        outline: none;
        & > * {
            margin: 1.875rem 0;
        }

        @media only screen and (min-width: 72rem) {
            max-width: 57.375rem;
            padding: 3.125rem 7.25rem;
        }
    `;

    const paragraph = css`
        p {
            font-size: 1rem;
            line-height: 1.5;
            letter-spacing: 0.5px;
        }
    `;

    const blockquote = css`
        blockquote {
            padding-left: 1.875rem;
            line-height: 1.75rem;
            border-left: 4px solid ${palette('primary')};
            * {
                font-size: 1rem;
                line-height: 1.5rem;
            }
        }
    `;

    const heading = css`
        h1 {
            font-size: 3rem;
            line-height: 3.5rem;
        }
        h2 {
            font-size: 2.5rem;
            line-height: 3rem;
        }
        h3 {
            font-size: 2.125rem;
            line-height: 2.25rem;
        }
        h4 {
            font-size: 1.75rem;
            line-height: 2rem;
        }
        h5 {
            font-size: 1.5rem;
            line-height: 1.5rem;
        }
        h6 {
            font-size: 1.25rem;
            line-height: 1.25rem;
        }
        .heading {
            margin: 2.5rem 0;
            font-weight: 400;
        }
    `;

    const hr = css`
        hr {
            height: ${manager.get(ThemeSize, 'lineWidth')};
            background-color: ${line};
            border-width: 0;
        }
    `;

    const list = css`
        .list-item,
        .list-item > * {
            margin: 0.5rem 0;
        }

        li {
            &::marker {
                color: ${palette('primary')};
            }
        }
    `;

    const code = css`
        .code-fence {
            pre {
                font-family: ${manager.get(ThemeFont, 'code')};
                margin: 0 1.2rem !important;
                white-space: pre;
                overflow: auto;
                ${manager.get(ThemeScrollbar, 'x')}

                background-color: ${palette('background')};
                color: ${palette('neutral')};
                font-size: 0.85rem;
                border-radius: ${radius};

                code {
                    line-height: 1.5;
                    font-family: ${manager.get(ThemeFont, 'code')};
                }
            }
        }
    `;

    const img = css`
        .image {
            display: inline-block;
            margin: 0 auto;
            object-fit: contain;
            width: 100%;
            position: relative;
            height: auto;
            text-align: center;
        }
    `;

    const inline = css`
        .code-inline {
            background-color: ${palette('neutral')};
            color: ${palette('background')};
            border-radius: ${radius};
            font-weight: 500;
            font-family: ${code};
            padding: 0 0.2rem;
        }

        .strong {
            font-weight: 600;
        }

        .link {
            color: ${palette('secondary')};
            cursor: pointer;
            transition: all 0.4s ease-in-out;
            font-weight: 500;
            &:hover {
                background-color: ${palette('line')};
                box-shadow: 0 0.2rem ${palette('line')}, 0 -0.2rem ${palette('line')};
            }
        }
    `;

    injectGlobal`
        .milkdown {

            position: relative;
            margin-left: auto;
            margin-right: auto;
            box-sizing: border-box;

            color: ${neutral};
            background: ${surface};
            font-family: ${manager.get(ThemeFont, 'typography')};

            ${manager.get(ThemeShadow)}
            ${manager.get(ThemeScrollbar, undefined)}
            ${selection};

            .editor {
                ${editorLayout};

                ${paragraph};
                ${heading};
                ${blockquote};
                ${hr};
                ${list};
                ${code};
                ${img};

                ${inline};
            }
        }
    `;
};
