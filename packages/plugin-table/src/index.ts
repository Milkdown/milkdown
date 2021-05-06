import { NodeSpec, NodeType } from 'prosemirror-model';
import { createProsemirrorPlugin, Node } from '@milkdown/core';
import { tableEditing } from 'prosemirror-tables';
import { wrappingInputRule } from 'prosemirror-inputrules';

export const key = 'MILKDOWN_PLUGIN_TABLE';

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
    inputRules = (nodeType: NodeType) => [wrappingInputRule(/^\s*<\s$/, nodeType)];
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

const plugin = createProsemirrorPlugin('table-plugin', () => [tableEditing()]);

export const table = [new Table(), new TableRow(), new TableCell(), new TableHeader(), plugin];
