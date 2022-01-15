/* Copyright 2021, Milkdown by Mirone. */
import { Emotion, ThemeTool } from '@milkdown/core';

export const injectStyle = ({ size, palette, mixin }: ThemeTool, { injectGlobal }: Emotion) => {
    const css = injectGlobal;
    css`
        .milkdown .paragraph {
            overflow: visible;
        }
        /* this is a rough fix for the first cursor position when the first paragraph is empty */
        .ProseMirror > .ProseMirror-yjs-cursor:first-child {
            margin-top: 16px;
        }
        .ProseMirror p:first-child,
        .ProseMirror h1:first-child,
        .ProseMirror h2:first-child,
        .ProseMirror h3:first-child,
        .ProseMirror h4:first-child,
        .ProseMirror h5:first-child,
        .ProseMirror h6:first-child {
            margin-top: 16px;
        }
        /* This gives the remote user caret. The colors are automatically overwritten*/
        .ProseMirror-yjs-cursor {
            position: relative;
            margin-left: -${size.lineWidth};
            margin-right: -${size.lineWidth};
            ${mixin.border?.('left')};
            ${mixin.border?.('right')};
            word-break: normal;
            pointer-events: none;
        }
        /* This renders the username above the caret */
        .ProseMirror-yjs-cursor > div {
            position: absolute;
            top: -1.05em;
            left: -${size.lineWidth};
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
