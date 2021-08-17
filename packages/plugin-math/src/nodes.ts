import { injectGlobal } from '@emotion/css';
import {
    makeBlockMathInputRule,
    makeInlineMathInputRule,
    REGEX_BLOCK_MATH_DOLLARS,
    REGEX_INLINE_MATH_DOLLARS,
} from '@benrbray/prosemirror-math';
import { AtomList, createNode } from '@milkdown/utils';

export const mathInline = createNode((options, utils) => {
    const css = injectGlobal;
    const { palette, size, font } = utils.themeTool;

    options?.headless
        ? null
        : css`
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

              // Define for milkdown start

              .math-node {
                  &,
                  * {
                      margin: 0 !important;
                      padding: 0;
                  }
              }

              math-inline .math-render {
                  padding: 0 4px;
                  display: inline-flex;
                  overflow: hidden;
                  justify-content: center;
                  align-items: center;
              }

              .math-src > div {
                  padding: 4px;
                  outline: none !important;
                  border-radius: ${size.radius};
                  font-weight: 500;
                  font-family: ${font.fontCode};
                  box-sizing: border-box;
                  color: ${palette('primary')};
              }

              .math-src,
              math-display.ProseMirror-selectednode {
                  color: ${palette('primary')};
                  background-color: ${palette('background')};
              }

              .ProseMirror-selectednode {
                  &.math-node {
                      outline: none !important;
                  }
              }
          `;

    const id = 'math_inline';
    return {
        id,
        schema: {
            group: 'inline math',
            content: 'text*',
            inline: true,
            atom: true,
            parseDOM: [{ tag: 'math-inline' }],
            toDOM: () => ['math-inline', { class: 'math-node' }, 0],
        },
        parser: {
            match: (node) => node.type === 'inlineMath',
            runner: (state, node, type) => {
                state.openNode(type);
                state.addText(node.value as string);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                let text = '';
                node.forEach((n) => {
                    text += n.text as string;
                });
                state.addNode('inlineMath', undefined, text);
            },
        },
        inputRules: (nodeType) => [makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, nodeType)],
    };
});

export const mathDisplay = createNode(() => {
    const id = 'math_display';
    return {
        id,
        schema: {
            group: 'block math',
            content: 'text*',
            atom: true,
            code: true,
            parseDOM: [{ tag: 'math-display' }],
            toDOM: () => ['math-display', { class: 'math-node' }, 0],
        },
        parser: {
            match: (node) => node.type === 'math',
            runner: (state, node, type) => {
                state.openNode(type);
                state.addText(node.value as string);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                let text = '';
                node.forEach((n) => {
                    text += n.text as string;
                });
                state.addNode('math', undefined, text);
            },
        },
        inputRules: (nodeType) => [makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, nodeType)],
    };
});

export const nodes = AtomList.create([mathInline(), mathDisplay()]);
