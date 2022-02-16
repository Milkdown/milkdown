/* Copyright 2021, Milkdown by Mirone. */
import { Color, Emotion, ThemeBorder, ThemeColor, ThemeManager, ThemeSize } from '@milkdown/core';

export const injectStyle = (themeManager: ThemeManager, { injectGlobal }: Emotion) => {
    const palette = (color: Color, opacity = 1) => themeManager.get(ThemeColor, [color, opacity]);
    const lineWidth = themeManager.get(ThemeSize, 'lineWidth');
    const css = injectGlobal;
    css`
        .milkdown .paragraph {
            overflow: visible;
        }
        /* this is a rough fix for the first cursor position when the first paragraph is empty */
        .ProseMirror > .ProseMirror-yjs-cursor:first-child {
            margin-top: 1em;
        }
        .ProseMirror p:first-child,
        .ProseMirror h1:first-child,
        .ProseMirror h2:first-child,
        .ProseMirror h3:first-child,
        .ProseMirror h4:first-child,
        .ProseMirror h5:first-child,
        .ProseMirror h6:first-child {
            margin-top: 1em;
        }
        /* This gives the remote user caret. The colors are automatically overwritten*/
        .ProseMirror-yjs-cursor {
            position: relative;
            margin-left: -${lineWidth};
            margin-right: -${lineWidth};
            ${themeManager.get(ThemeBorder, 'left')};
            ${themeManager.get(ThemeBorder, 'right')};
            word-break: normal;
            pointer-events: none;
        }
        /* This renders the username above the caret */
        .ProseMirror-yjs-cursor > div {
            position: absolute;
            top: -1.05em;
            left: -${lineWidth};
            font-size: 13px;
            background-color: ${palette('background')};
            font-family: serif;
            font-style: normal;
            font-weight: normal;
            line-height: normal;
            user-select: none;
            color: white;
            padding-left: 2px;
            padding-right: 2px;
            white-space: nowrap;
        }
    `;
};
