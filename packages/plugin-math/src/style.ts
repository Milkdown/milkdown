/* Copyright 2021, Milkdown by Mirone. */
import { css } from '@emotion/css';
export const style = css`
    /* copy from https://github.com/benrbray/prosemirror-math/blob/master/style/math.css */
    /*---------------------------------------------------------
               *  Author: Benjamin R. Bray
               *  License: MIT (see LICENSE in project root for details)
               *--------------------------------------------------------*/

    /* == Math Nodes ======================================== */

    .math-node {
        min-width: 1em;
        min-height: 1em;
        font-size: 0.95em;
        font-family: 'Consolas', 'Ubuntu Mono', monospace;
        cursor: auto;
    }

    .math-node.empty-math .math-render::before {
        content: '(empty)';
        color: red;
    }

    .math-node .math-render.parse-error::before {
        content: '(math error)';
        color: red;
        cursor: help;
    }

    .math-node.ProseMirror-selectednode {
        outline: none;
    }

    .math-node .math-src {
        display: none;
        color: rgb(132, 33, 162);
        tab-size: 4;
    }

    .math-node.ProseMirror-selectednode .math-src {
        display: inline;
    }
    .math-node.ProseMirror-selectednode .math-render {
        display: none;
    }

    /* -- Inline Math --------------------------------------- */

    math-inline {
        display: inline;
        white-space: nowrap;
    }

    math-inline .math-render {
        display: inline-block;
        font-size: 0.85em;
        cursor: pointer;
    }

    math-inline .math-src .ProseMirror {
        display: inline;
        /* Necessary to fix FireFox bug with contenteditable, https://bugzilla.mozilla.org/show_bug.cgi?id=1252108 */
        border-right: 1px solid transparent;
        border-left: 1px solid transparent;
    }

    math-inline .math-src::after,
    math-inline .math-src::before {
        content: '$';
        color: #b0b0b0;
    }

    /* -- Block Math ---------------------------------------- */

    math-display {
        display: block;
    }

    math-display .math-render {
        display: block;
    }

    math-display.ProseMirror-selectednode {
        background-color: #eee;
    }

    math-display .math-src .ProseMirror {
        width: 100%;
        display: block;
    }

    math-display .math-src::after,
    math-display .math-src::before {
        content: '$$';
        text-align: left;
        color: #b0b0b0;
    }

    math-display .katex-display {
        margin: 0;
    }

    /* -- Selection Plugin ---------------------------------- */

    p::selection,
    p > *::selection {
        background-color: #c0c0c0;
    }
    .katex-html *::selection {
        background-color: none !important;
    }

    .math-node.math-select .math-render {
        background-color: #c0c0c0ff;
    }
    math-inline.math-select .math-render {
        padding-top: 2px;
    }
`;
