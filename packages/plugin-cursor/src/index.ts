/* Copyright 2021, Milkdown by Mirone. */
import { ThemeColor, themeManagerCtx, ThemeSize } from '@milkdown/core';
import { dropCursor } from '@milkdown/prose/dropcursor';
import { gapCursor } from '@milkdown/prose/gapcursor';
import { createPlugin } from '@milkdown/utils';

export const cursor = createPlugin(({ getStyle, themeManager }) => {
    themeManager.onFlush(() => {
        getStyle(({ injectGlobal }) => {
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
                    border-top: ${themeManager.get(ThemeSize, 'lineWidth')} solid
                        ${themeManager.get(ThemeColor, ['secondary'])};
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
    });

    return {
        prosePlugins: (_, ctx) => {
            const themeManager = ctx.get(themeManagerCtx);
            const lineWidth = themeManager.get(ThemeSize, 'lineWidth');
            const secondary = themeManager.get(ThemeColor, ['secondary']);

            const width = Number(lineWidth?.match(/\d+/)?.[0] ?? 1);

            return [gapCursor(), dropCursor({ color: secondary, width })];
        },
    };
})();
