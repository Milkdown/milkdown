/* eslint-disable @typescript-eslint/no-empty-function */
import { Node as MarkdownNode } from 'unist';
import { Node, NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { tableNodes } from 'prosemirror-tables';
import { InputRule } from 'prosemirror-inputrules';
import { TextSelection } from 'prosemirror-state';
import { createTable } from './utils';

const tableNodesSpec = tableNodes({
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

export class Table extends Node {
    override readonly id = 'table';
    override readonly schema: NodeSpec = tableNodesSpec.table;
    override readonly parser: NodeParserSpec = {
        match: (node) => node.type === 'table',
        runner: (type, state, node) => {
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
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (node, state) => {
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
    };
    override inputRules = (nodeType: NodeType, schema: Schema): InputRule[] => [
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
    parser: NodeParserSpec = {
        match: (node) => node.type === 'tableRow',
        runner: (type, state, node) => {
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
    };
    serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (node, state) => {
            state.openNode('tableRow');
            state.next(node.content);
            state.closeNode();
        },
    };
}

export class TableCell extends Node {
    id = 'table_cell';
    schema: NodeSpec = tableNodesSpec.table_cell;
    parser: NodeParserSpec = {
        match: (node) => node.type === 'tableCell' && !node.isHeader,
        runner: (type, state, node) => {
            const align = node.align as string;
            state.openNode(type, { alignment: align });
            state.openNode(state.schema.nodes.paragraph);
            state.next(node.children);
            state.closeNode();
            state.closeNode();
        },
    };
    serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (node, state) => {
            state.openNode('tableCell');
            state.next(node.content);
            state.closeNode();
        },
    };
}

export class TableHeader extends Node {
    id = 'table_header';
    schema: NodeSpec = tableNodesSpec.table_header;
    parser: NodeParserSpec = {
        match: (node) => node.type === 'tableCell' && !!node.isHeader,
        runner: (type, state, node) => {
            const align = node.align as string;
            state.openNode(type, { alignment: align });
            state.openNode(state.schema.nodes.paragraph);
            state.next(node.children);
            state.closeNode();
            state.closeNode();
        },
    };
    serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (node, state) => {
            state.openNode('tableCell');
            state.next(node.content);
            state.closeNode();
        },
    };
}

export const nodes = [new Table(), new TableRow(), new TableCell(), new TableHeader()];
