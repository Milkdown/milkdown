/* Copyright 2021, Milkdown by Mirone. */
import { createCmd, createCmdKey, MarkdownNode, schemaCtx } from '@milkdown/core';
import { InputRule } from '@milkdown/prose/inputrules';
import { NodeType } from '@milkdown/prose/model';
import { Selection, TextSelection } from '@milkdown/prose/state';
import { createPlugin, createShortcut } from '@milkdown/utils';

import { exitTable } from '../command';
import { operatorPlugin } from '../operator-plugin';
import { autoInsertZeroSpace } from '../plugin/auto-insert-zero-space';
import { columnResizing } from '../plugin/column-resizing';
import { goToNextCell } from '../plugin/commands';
import { schema } from '../plugin/schema';
import { tableEditing } from '../plugin/table-editing';
import { createTable } from '../utils';

export const SupportedKeys = {
    NextCell: 'NextCell',
    PrevCell: 'PrevCell',
    ExitTable: 'ExitTable',
} as const;
export type SupportedKeys = typeof SupportedKeys;

type Keys = keyof SupportedKeys;

export const PrevCell = createCmdKey('PrevCell');
export const NextCell = createCmdKey('NextCell');
export const BreakTable = createCmdKey('BreakTable');
export const InsertTable = createCmdKey('InsertTable');

export const table = createPlugin<Keys, Record<string, unknown>, keyof typeof schema>((utils) => {
    return {
        schema: () => ({
            node: {
                table: {
                    ...schema.table,
                    parseMarkdown: {
                        match: (node) => node.type === 'table',
                        runner: (state, node, type) => {
                            const align = node['align'] as (string | null)[];
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
                    toMarkdown: {
                        match: (node) => node.type.name === 'table',
                        runner: (state, node) => {
                            const firstLine = node.content.firstChild?.content;
                            if (!firstLine) return;

                            const align: (string | null)[] = [];
                            firstLine.forEach((cell) => {
                                align.push(cell.attrs['alignment']);
                            });
                            state.openNode('table', undefined, { align });
                            state.next(node.content);
                            state.closeNode();
                        },
                    },
                },
                table_row: {
                    ...schema.table_row,
                    parseMarkdown: {
                        match: (node) => node.type === 'tableRow',
                        runner: (state, node, type) => {
                            const align = node['align'] as (string | null)[];
                            const children = (node.children as MarkdownNode[]).map((x, i) => ({
                                ...x,
                                align: align[i],
                                isHeader: node['isHeader'],
                            }));
                            state.openNode(type);
                            state.next(children);
                            state.closeNode();
                        },
                    },
                    toMarkdown: {
                        match: (node) => node.type.name === 'table_row',
                        runner: (state, node) => {
                            state.openNode('tableRow');
                            state.next(node.content);
                            state.closeNode();
                        },
                    },
                },
                table_cell: {
                    ...schema.table_cell,
                    parseMarkdown: {
                        match: (node) => node.type === 'tableCell' && !node['isHeader'],
                        runner: (state, node, type) => {
                            const align = node['align'] as string;
                            state
                                .openNode(type, { alignment: align })
                                .openNode(state.schema.nodes['paragraph'] as NodeType)
                                .next(node.children)
                                .closeNode()
                                .closeNode();
                        },
                    },
                    toMarkdown: {
                        match: (node) => node.type.name === 'table_cell',
                        runner: (state, node) => {
                            state.openNode('tableCell').next(node.content).closeNode();
                        },
                    },
                },
                table_header: {
                    ...schema.table_header,
                    parseMarkdown: {
                        match: (node) => node.type === 'tableCell' && !!node['isHeader'],
                        runner: (state, node, type) => {
                            const align = node['align'] as string;
                            state.openNode(type, { alignment: align });
                            state.openNode(state.schema.nodes['paragraph'] as NodeType);
                            state.next(node.children);
                            state.closeNode();
                            state.closeNode();
                        },
                    },
                    toMarkdown: {
                        match: (node) => node.type.name === 'table_header',
                        runner: (state, node) => {
                            state.openNode('tableCell');
                            state.next(node.content);
                            state.closeNode();
                        },
                    },
                },
            },
        }),
        inputRules: (nodeType, ctx) => [
            new InputRule(/^\|\|\s$/, (state, _match, start, end) => {
                const $start = state.doc.resolve(start);
                if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType.table))
                    return null;

                const tableNode = createTable(ctx.get(schemaCtx));
                const tr = state.tr.replaceRangeWith(start, end, tableNode).scrollIntoView();
                return tr.setSelection(TextSelection.create(tr.doc, start + 3));
            }),
        ],
        commands: (_, ctx) => [
            createCmd(PrevCell, () => goToNextCell(-1)),
            createCmd(NextCell, () => goToNextCell(1)),
            createCmd(BreakTable, () => exitTable(ctx.get(schemaCtx).nodes['paragraph'] as NodeType)),
            createCmd(InsertTable, () => (state, dispatch) => {
                const { selection, tr } = state;
                const { from } = selection;
                const table = createTable(ctx.get(schemaCtx));
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
        prosePlugins: (_, ctx) => {
            return [operatorPlugin(ctx, utils), autoInsertZeroSpace(), columnResizing(), tableEditing()];
        },
    };
});
