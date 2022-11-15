/* Copyright 2021, Milkdown by Mirone. */

import type { Emotion, ThemeManager } from '@milkdown/core'
import { ThemeBorder, ThemeFont, ThemeScrollbar, ThemeShadow, ThemeSize } from '@milkdown/core'
import { getPalette } from '@milkdown/design-system'
import { injectProsemirrorView } from '@milkdown/theme-pack-helper'

export const getStyle = (manager: ThemeManager, emotion: Emotion) => {
  const { injectGlobal, css } = emotion
  const palette = getPalette(manager)
  const radius = manager.get(ThemeSize, 'radius')
  const neutral = palette('neutral', 0.87)
  const surface = palette('surface')
  const line = palette('line')
  const highlight = palette('secondary', 0.38)

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
    `

  const editorLayout = css`
        padding: 50px 20px;
        outline: none;
        & > * {
            margin: 30px 0;
        }
    `

  const paragraph = css`
        p {
            font-size: 16px;
            line-height: 1.5;
            letter-spacing: 0.5px;
        }
    `

  const blockquote = css`
        blockquote {
            padding-left: 30px;
            line-height: 28px;
            border-left: 4px solid ${palette('primary')};
            margin-left: 0;
            margin-right: 0;
            * {
                font-size: 16px;
                line-height: 24px;
            }
        }
    `

  const heading = css`
        h1 {
            font-size: 48px;
            line-height: 1.167;
        }
        h2 {
            font-size: 40px;
            line-height: 1.2;
        }
        h3 {
            font-size: 34px;
            line-height: 1.05;
        }
        h4 {
            font-size: 28px;
            line-height: 1.14;
        }
        h5 {
            font-size: 24px;
            line-height: 1;
        }
        h6 {
            font-size: 20px;
            line-height: 1;
        }
        .heading {
            margin: 40px 0;
            font-weight: 400;
        }
    `

  const hr = css`
        hr {
            height: ${manager.get(ThemeSize, 'lineWidth')};
            background-color: ${line};
            border-width: 0;
        }
    `

  const list = css`
        ul,
        ol {
            padding: 0;
        }

        .list-item,
        .task-list-item {
            margin-top: 8px;
        }

        .list-item_label,
        .list-item .paragraph {
            margin: 0;
        }

        .list-item {
            display: flex;

            &_body {
                flex: 1;
            }
        }

        .list-item_label {
            display: flex;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-size: 16px;
            line-height: 1.5;
            color: ${palette('primary')};
        }

        .list-item[data-list-type='bullet'] {
            & > .list-item_label {
                font-size: 24px;
                line-height: 1;
            }
        }

        li {
            &::marker {
                display: none;
            }
        }

        .task-list-item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            &_checkbox {
                margin: 8px 8px 8px 0;
                height: 16px;
            }
            & .paragraph {
                margin: 0;
            }
        }
    `

  const code = css`
        .code-fence {
            pre {
                font-family: ${manager.get(ThemeFont, 'code')};
                margin: 0 18px;
                ${manager.get(ThemeScrollbar, ['x'])}

                background-color: ${palette('background')};
                color: ${palette('neutral')};
                font-size: 14px;
                border-radius: ${radius};

                code {
                    line-height: 1.5;
                    font-family: ${manager.get(ThemeFont, 'code')};
                }
            }
        }
    `

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
    `

  const inline = css`
        .code-inline {
            background-color: ${palette('neutral')};
            color: ${palette('background')};
            border-radius: ${radius};
            font-weight: 500;
            font-family: ${manager.get(ThemeFont, 'code')};
            padding: 0 3px;
        }

        .strong {
            font-weight: 600;
        }

        .link,
        a {
            color: ${palette('secondary')};
            cursor: pointer;
            transition: all 0.4s ease-in-out;
            font-weight: 500;
            &:hover {
                background-color: ${palette('line')};
                box-shadow: 0 3px ${palette('line')}, 0 -3px ${palette('line')};
            }
        }

        .strike-through {
            text-decoration-color: ${palette('secondary')};
        }
    `

  const footnote = css`
        .footnote-definition {
            ${manager.get(ThemeBorder, undefined)};
            border-radius: ${manager.get(ThemeSize, 'radius')};
            background-color: ${palette('background')};
            padding: 16px;
            display: flex;
            flex-direction: row;
            & > .footnote-definition_content {
                flex: 1;
                width: calc(100% - 16px);
                & > dd {
                    margin-inline-start: 16px;
                }
                & > dt {
                    color: ${palette('secondary')};
                    font-weight: 500;
                }
            }
            & > .footnote-definition_anchor {
                width: 16px;
            }
        }
    `

  const table = css`
        /* copy from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
        .tableWrapper {
            overflow-x: auto;
            margin: 0;
            ${manager.get(ThemeScrollbar, ['x'])}
            width: 100%;
            * {
                margin: 0;
                box-sizing: border-box;
                font-size: 16px;
            }
        }
        table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            overflow: auto;
            border-radius: ${manager.get(ThemeSize, 'radius')};
        }
        tr {
            ${manager.get(ThemeBorder, 'bottom')};
        }
        td,
        th {
            padding: 0 16px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;

            min-width: 100px;
            ${manager.get(ThemeBorder, undefined)};
            text-align: left;
            line-height: 3;
            height: 48px;
            vertical-align: middle;
        }
        th {
            background: ${palette('background', 0.5)};
            font-weight: 400;
        }
        .column-resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: 0;
            z-index: 20;
            pointer-events: none;
            background: ${palette('secondary')};
            width: ${manager.get(ThemeSize, 'lineWidth')};
        }

        .selectedCell {
            &::after {
                z-index: 2;
                position: absolute;
                content: '';
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                background: ${palette('secondary', 0.38)};
                pointer-events: none;
            }

            & ::selection {
                background: transparent;
            }
        }
    `

  injectProsemirrorView(emotion)

  injectGlobal`
        .milkdown {
            .material-icons-outlined {
                font-size: 24px;
            }

            position: relative;
            margin-left: auto;
            margin-right: auto;
            box-sizing: border-box;


            color: ${neutral};
            background: ${surface};
            font-family: ${manager.get(ThemeFont, 'typography')};

            ${manager.get(ThemeShadow, undefined)}
            ${manager.get(ThemeScrollbar, undefined)}
            ${selection};

            .resize-cursor {
                cursor: ew-resize;
                cursor: col-resize;
            }

            .editor {
                ${editorLayout};

                ${paragraph};
                ${blockquote};
                ${hr};
                ${list};
                ${code};
                ${img};
                ${heading};

                ${table};
                ${footnote};

                ${inline};
            }
        }
    `
}
