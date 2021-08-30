/* Copyright 2021, Milkdown by Mirone. */
import { css, injectGlobal } from '@emotion/css';
import { Utils } from '@milkdown/utils';

const proseTableStyle = css`
    /* copy from https://github.com/ProseMirror/prosemirror-tables/blob/master/style/tables.css */
    .ProseMirror .tableWrapper {
        overflow-x: auto;
    }
    .ProseMirror table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        overflow: hidden;
    }
    .ProseMirror td,
    .ProseMirror th {
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
    }
    .ProseMirror .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
    }
    .ProseMirror.resize-cursor {
        cursor: ew-resize;
        cursor: col-resize;
    }
    /* Give selected cells a blue overlay */
    .ProseMirror .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: '';
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
    }
`;

export const injectStyle = (utils: Utils) => {
    const css = injectGlobal;
    return utils.getStyle(({ size, palette, mixin }) => {
        css`
            ${proseTableStyle}

            .tableWrapper {
                margin: 0 !important;

                ${mixin.scrollbar?.('x')};

                width: 100%;

                table {
                    width: calc(100% - 2rem) !important;
                    border-radius: ${size.radius};
                    box-sizing: border-box;
                    margin: 1rem 0 1rem 1rem !important;
                    overflow: auto !important;
                    * {
                        margin: 0 !important;
                        box-sizing: border-box;
                        font-size: 1rem;
                    }
                    tr {
                        ${mixin.border?.('bottom')};
                    }

                    th {
                        background: ${palette('background', 0.5)};
                        font-weight: 400;
                    }

                    th,
                    td {
                        min-width: 100px;
                        ${mixin.border?.()};
                        text-align: left;
                        position: relative;
                        line-height: 3rem;
                        box-sizing: border-box;
                        height: 3rem;
                    }

                    .selectedCell {
                        &::after {
                            background: ${palette('secondary', 0.38)};
                        }
                        & ::selection {
                            background: transparent;
                        }
                    }

                    .column-resize-handle {
                        background: ${palette('primary')};
                        width: ${size.lineWidth};
                    }

                    th,
                    td {
                        padding: 0 1rem;
                        p {
                            line-height: unset !important;
                        }
                    }

                    .milkdown-cell-left,
                    .milkdown-cell-point,
                    .milkdown-cell-top {
                        position: absolute;

                        &::after {
                            cursor: pointer;
                            position: absolute;
                            top: 0;
                            left: 0;
                            height: 100%;
                            width: 100%;
                            display: block;
                            transition: all 0.2s ease-in-out;
                            background: ${palette('secondary', 0.12)};
                            content: '';
                        }
                        &:hover::after {
                            background: ${palette('secondary', 0.38)};
                        }
                    }

                    .milkdown-cell-left {
                        left: calc(-6px - 0.5rem);
                        top: 0;
                        bottom: 0;
                        width: 0.5rem;
                    }

                    .milkdown-cell-top {
                        left: 0;
                        right: 0;
                        top: calc(-6px - 0.5rem);
                        height: 0.5rem;
                    }

                    .milkdown-cell-point {
                        left: calc(-2px - 1rem);
                        top: calc(-2px - 1rem);
                        width: 1rem;
                        height: 1rem;

                        .icon {
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            left: 0;
                            right: 0;
                        }
                    }
                }
            }
        `;
    });
};
