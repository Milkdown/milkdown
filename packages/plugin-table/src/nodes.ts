import { Node, ParserSpec } from '@milkdown/core';
import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import { createTable } from './utils';

const tableNodesSpec = tableNodes({
    tableGroup: 'block',
    cellContent: 'block+',
    cellAttributes: {
        alignment: {
            default: 'left',
            getFromDOM: (dom) => (dom as HTMLElement).style.textAlign || 'left',
            setDOMAttr: (value, attrs) => {
                attrs.style = `text-align: ${value}`;
            },
        },
    },
});

export class Table extends Node {
    id = 'table';
    schema: NodeSpec = tableNodesSpec.table;
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
            return tr.setSelection(TextSelection.create(tr.doc, start + 3));
        }),
    ];
}

export class TableRow extends Node {
    id = 'table_row';
    schema: NodeSpec = tableNodesSpec.table_row;
    parser = {
        block: 'tr',
    };
    serializer = () => {
        // TODO
    };
}

export class TableCell extends Node {
    id = 'table_cell';
    schema: NodeSpec = tableNodesSpec.table_cell;
    parser: ParserSpec = {
        block: 'td',
        getAttrs: (tok) => ({ alignment: tok.info }),
    };
    serializer = () => {
        // TODO
    };
}

export class TableHeader extends Node {
    id = 'table_header';
    schema: NodeSpec = tableNodesSpec.table_header;
    parser: ParserSpec = {
        block: 'th',
        getAttrs: (tok) => ({ alignment: tok.info }),
    };
    serializer = () => {
        // TODO
    };
}

export const nodes = [new Table(), new TableRow(), new TableCell(), new TableHeader()];
