import { injectGlobal } from '@emotion/css';
import type { Awareness } from 'y-protocols/awareness';
import { Doc, XmlFragment } from 'yjs';
import { prosePluginFactory, themeToolCtx } from '@milkdown/core';
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror';
import { keymap } from 'prosemirror-keymap';

const collaborative = (doc: Doc, awareness: Awareness) => {
    const type = doc.get('prosemirror', XmlFragment);
    return prosePluginFactory((ctx) => {
        const { size, palette } = ctx.get(themeToolCtx);

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
                border-left: ${size.lineWidth} solid black;
                border-right: ${size.lineWidth} solid black;
                border-color: ${palette('line')};
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

        return [
            ySyncPlugin(type),
            yCursorPlugin(awareness),
            yUndoPlugin(),
            keymap({
                'Mod-z': undo,
                'Mod-y': redo,
                'Mod-Shift-z': redo,
            }),
        ];
    });
};

export { collaborative };
