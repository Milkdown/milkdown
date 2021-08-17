import { createCmdKey, createCmd } from '@milkdown/core';
import { injectGlobal } from '@emotion/css';
import { AtomList, createNode, createShortcut } from '@milkdown/utils';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection, Selection } from 'prosemirror-state';
import { goToNextCell, tableNodes as tableNodesSpecCreator } from 'prosemirror-tables';
import { Node as MarkdownNode } from 'unist';
import { exitTable } from './command';
import { createTable } from './utils';

const tableNodesSpec = tableNodesSpecCreator({
    tableGroup: 'block',
    cellContent: 'paragraph',
    cellAttributes: {
        alignment: {
            default: 'left',
            getFromDOM: (dom) => (dom as HTMLElement).style.textAlign || 'left',
            setDOMAttr: (value, attrs) => {
                attrs.style = `text-align: ${value || 'left'}`;
            },
        },
    },
});

export const SupportedKeys = {
    NextCell: 'NextCell',
    PrevCell: 'PrevCell',
    ExitTable: 'ExitTable',
} as const;
export type SupportedKeys = typeof SupportedKeys;

type Keys = keyof SupportedKeys;

export const PrevCell = createCmdKey();
export const NextCell = createCmdKey();
export const BreakTable = createCmdKey();
export const InsertTable = createCmdKey();

export const table = createNode<Keys>((options, utils) => {
    const id = 'table';
    const { size, palette, widget } = utils.themeTool;
    const css = injectGlobal;

    options?.headless
        ? null
        : css`
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

              .tableWrapper {
                  margin: 0 !important;

                  ${widget.scrollbar?.('x')};

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
                          border-bottom: ${size.lineWidth} solid ${palette('line')};
                      }

                      th {
                          background: ${palette('background', 0.5)};
                          font-weight: 400;
                      }

                      th,
                      td {
                          min-width: 100px;
                          border: ${size.lineWidth} solid ${palette('line')};
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
                              transition: all 0.4s ease-in-out;
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

                          &::after {
                              ${widget.icon?.('select_all')};
                              color: ${palette('solid', 0.87)};
                              font-size: inherit;
                          }
                          &:hover::after {
                              background: transparent;
                              color: ${palette('primary')};
                          }
                      }
                  }
              }
          `;

    return {
        id,
        schema: tableNodesSpec.table,
        parser: {
            match: (node) => node.type === 'table',
            runner: (state, node, type) => {
                const align = node.align as (string | null)[];
                const children = (node.children as MarkdownNode[]).map((x, i) => ({
                    ...x,
                    align,
                    isHeader: i === 0,
                }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                const firstLine = node.content.firstChild?.content;
                if (!firstLine) return;

                const align: (string | null)[] = [];
                firstLine.forEach((cell) => {
                    align.push(cell.attrs.alignment);
                });
                state.openNode('table', undefined, { align });
                state.next(node.content);
                state.closeNode();
            },
        },
        inputRules: (nodeType, schema) => [
            new InputRule(/^\|\|\s$/, (state, _match, start, end) => {
                const $start = state.doc.resolve(start);
                if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;

                const tableNode = createTable(schema);
                const tr = state.tr.replaceRangeWith(start, end, tableNode).scrollIntoView();
                return tr.setSelection(TextSelection.create(tr.doc, start + 3));
            }),
        ],
        commands: (_, schema) => [
            createCmd(PrevCell, () => goToNextCell(-1)),
            createCmd(NextCell, () => goToNextCell(1)),
            createCmd(BreakTable, () => exitTable(schema.nodes.paragraph)),
            createCmd(InsertTable, () => (state, dispatch) => {
                const { selection, tr } = state;
                const { from } = selection;
                const table = createTable(schema);
                const _tr = tr.replaceSelectionWith(table);
                const sel = Selection.findFrom(_tr.doc.resolve(from), 1, true);
                if (sel) {
                    dispatch?.(_tr.setSelection(sel));
                }
                return true;
            }),
        ],
        shortcuts: {
            [SupportedKeys.NextCell]: createShortcut(NextCell, 'Mod-]'),
            [SupportedKeys.PrevCell]: createShortcut(PrevCell, 'Mod-['),
            [SupportedKeys.ExitTable]: createShortcut(BreakTable, 'Mod-Enter'),
        },
    };
});

export const tableRow = createNode(() => {
    const id = 'table_row';
    return {
        id,
        schema: tableNodesSpec.table_row,
        parser: {
            match: (node) => node.type === 'tableRow',
            runner: (state, node, type) => {
                const align = node.align as (string | null)[];
                const children = (node.children as MarkdownNode[]).map((x, i) => ({
                    ...x,
                    align: align[i],
                    isHeader: node.isHeader,
                }));
                state.openNode(type);
                state.next(children);
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableRow');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});

export const tableCell = createNode(() => {
    const id = 'table_cell';
    return {
        id,
        schema: tableNodesSpec.table_cell,
        parser: {
            match: (node) => node.type === 'tableCell' && !node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state
                    .openNode(type, { alignment: align })
                    .openNode(state.schema.nodes.paragraph)
                    .next(node.children)
                    .closeNode()
                    .closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell').next(node.content).closeNode();
            },
        },
    };
});

export const tableHeader = createNode(() => {
    const id = 'table_header';
    return {
        id,
        schema: tableNodesSpec.table_header,
        parser: {
            match: (node) => node.type === 'tableCell' && !!node.isHeader,
            runner: (state, node, type) => {
                const align = node.align as string;
                state.openNode(type, { alignment: align });
                state.openNode(state.schema.nodes.paragraph);
                state.next(node.children);
                state.closeNode();
                state.closeNode();
            },
        },
        serializer: {
            match: (node) => node.type.name === id,
            runner: (state, node) => {
                state.openNode('tableCell');
                state.next(node.content);
                state.closeNode();
            },
        },
    };
});

export const tableNodes = AtomList.create([table(), tableRow(), tableCell(), tableHeader()]);
