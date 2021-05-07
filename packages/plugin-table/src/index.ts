import { createProsemirrorPlugin, Node } from '@milkdown/core';
import { NodeSpec, NodeType, Schema, Node as ProsemirrorNode } from 'prosemirror-model';
import { tableEditing, tableNodeTypes } from 'prosemirror-tables';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';

export const key = 'MILKDOWN_PLUGIN_TABLE';

const createTable = (schema: Schema, rowsCount = 3, colsCount = 3) => {
    const { cell: tableCell, header_cell: tableHeader, row: tableRow, table } = tableNodeTypes(schema);

    const cells = Array(colsCount)
        .fill(0)
        .map(() => tableCell.createAndFill() as ProsemirrorNode);

    const headerCells = Array(colsCount)
        .fill(0)
        .map(() => tableHeader.createAndFill() as ProsemirrorNode);

    const rows = Array(rowsCount)
        .fill(0)
        .map((_, i) => tableRow.createChecked(null, i === 0 ? headerCells : cells));

    return table.createChecked(null, rows);
};

class Table extends Node {
    id = 'table';
    schema: NodeSpec = {
        content: 'table_row+',
        tableRole: 'table',
        isolating: true,
        group: 'block',
        parseDOM: [{ tag: 'table' }],
        toDOM: () => ['table', ['tbody', 0]],
    };
    parser = {
        block: this.id,
    };
    serializer = () => {
        // TODO
    };
    inputRules = (nodeType: NodeType, schema: Schema) => [
        new InputRule(/^\|\|\s$/, (state, _match, start, end) => {
            const $start = state.doc.resolve(start);
            if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;

            const tableNode = createTable(schema);
            const tr = state.tr.replaceRangeWith(start, end, tableNode).scrollIntoView();
            return tr.setSelection(TextSelection.create(tr.doc, start));
        }),
    ];
}

class TableRow extends Node {
    id = 'table_row';
    schema: NodeSpec = {
        content: '(table_cell | table_header)*',
        tableRole: 'row',
        parseDOM: [{ tag: 'tr' }],
        toDOM: () => ['tr', 0],
    };
    parser = {
        block: this.id,
    };
    serializer = () => {
        // TODO
    };
}

class TableCell extends Node {
    id = 'table_cell';
    schema: NodeSpec = {
        content: 'block+',
        tableRole: 'cell',
        parseDOM: [{ tag: 'td' }],
        toDOM: () => ['td', 0],
    };
    parser = {
        block: this.id,
    };
    serializer = () => {
        // TODO
    };
}

class TableHeader extends Node {
    id = 'table_header';
    schema: NodeSpec = {
        content: 'block+',
        tableRole: 'header_cell',
        parseDOM: [{ tag: 'th' }],
        toDOM: () => ['th', 0],
    };
    parser = {
        block: this.id,
    };
    serializer = () => {
        // TODO
    };
}

const plugin = createProsemirrorPlugin(key, () => [tableEditing()]);

export const table = [new Table(), new TableRow(), new TableCell(), new TableHeader(), plugin];
