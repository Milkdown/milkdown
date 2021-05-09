import { Node, ParserSpec, SerializerNode } from '@milkdown/core';
import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import { createTable } from './utils';

const tableNodesSpec = tableNodes({
    tableGroup: 'block',
    cellContent: 'table_inline',
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
    serializer: SerializerNode = (state, node) => {
        let headerBuffer = '';
        state.ensureNewLine();
        node.forEach((row, _, i) => {
            if (headerBuffer) {
                state.write(`${headerBuffer}|\n`);
                headerBuffer = '';
            }

            row.forEach((cell, _, j) => {
                state.write(j === 0 ? '| ' : ' | ');
                cell.forEach((para) => {
                    state.renderInline(para);
                });

                if (i === 0) {
                    if (cell.attrs.alignment === 'center') {
                        headerBuffer += '|:---:';
                    } else if (cell.attrs.alignment === 'left') {
                        headerBuffer += '|:---';
                    } else if (cell.attrs.alignment === 'right') {
                        headerBuffer += '|---:';
                    } else {
                        headerBuffer += '|----';
                    }
                }
            });

            state.write(' |\n');
        });
        state.closeBlock(node);
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
        // do nothing
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
        // do nothing
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
        // do nothing
    };
}

export class TableInline extends Node {
    id = 'table_inline';
    schema = {
        content: 'inline*',
        group: 'block',
        parseDOM: [{ tag: 'span' }],
        toDOM: () => ['span', { class: 'table-inline' }, 0] as const,
    };
    parser: ParserSpec = {
        block: this.id,
    };
    serializer = () => {
        // do nothing
    };
}

export const nodes = [new Table(), new TableRow(), new TableCell(), new TableHeader(), new TableInline()];
