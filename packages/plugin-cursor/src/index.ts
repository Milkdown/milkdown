/* Copyright 2021, Milkdown by Mirone. */
import { themeToolCtx } from '@milkdown/core';
import { dropCursor, gapCursor } from '@milkdown/prose';
import { createPlugin } from '@milkdown/utils';

export const cursor = createPlugin((utils) => {
    utils.getStyle((themeTool, { injectGlobal }) => {
        const css = injectGlobal;
        css`
            /* copy from https://github.com/ProseMirror/prosemirror-gapcursor/blob/master/style/gapcursor.css */
            .ProseMirror-gapcursor {
                display: none;
                pointer-events: none;
                position: absolute;
                margin: 0 !important;
            }

            .ProseMirror-gapcursor:after {
                content: '';
                display: block;
                position: absolute;
                top: -2px;
                width: 20px;
                border-top: ${themeTool.size.lineWidth} solid ${themeTool.palette('secondary')};
                animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
            }

            @keyframes ProseMirror-cursor-blink {
                to {
                    visibility: hidden;
                }
            }

            .ProseMirror-focused .ProseMirror-gapcursor {
                display: block;
            }
        `;
    });

    return {
        prosePlugins: (_, ctx) => {
            const themeTool = ctx.get(themeToolCtx);

            const lineWidth = themeTool.size.lineWidth;
            const width = Number(lineWidth?.match(/\d+/)?.[0] ?? 1);

            return [gapCursor(), dropCursor({ color: themeTool.palette('secondary'), width })];
        },
    };
})();
