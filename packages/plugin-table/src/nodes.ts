import { Atom, Node, NodeParserSpec, NodeSerializerSpec } from '@milkdown/core';
import { BaseNode } from '@milkdown/utils';
import { InputRule } from 'prosemirror-inputrules';
import { NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
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

export enum SupportedKeys {
    NextCell = 'NextCell',
    PrevCell = 'PrevCell',
    ExitTable = 'ExitTable',
}
type Keys = SupportedKeys.NextCell | SupportedKeys.PrevCell | SupportedKeys.ExitTable;
export class Table extends BaseNode<Keys> {
    override readonly id = 'table';
    override readonly schema: NodeSpec = tableNodesSpec.table;
    override readonly parser: NodeParserSpec = {
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
    };
    override readonly serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
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
    override readonly commands: BaseNode<Keys>['commands'] = (_, schema: Schema) => ({
        [SupportedKeys.NextCell]: {
            defaultKey: 'Mod-]',
            command: goToNextCell(1),
        },
        [SupportedKeys.PrevCell]: {
            defaultKey: 'Mod-[',
            command: goToNextCell(-1),
        },
        [SupportedKeys.ExitTable]: {
            defaultKey: 'Mod-Enter',
            command: exitTable(schema.nodes.paragraph),
        },
    });
}

export class TableRow extends Node {
    id = 'table_row';
    schema: NodeSpec = tableNodesSpec.table_row;
    parser: NodeParserSpec = {
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
    };
    serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
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
        runner: (state, node, type) => {
            const align = node.align as string;
            state
                .openNode(type, { alignment: align })
                .openNode(state.schema.nodes.paragraph)
                .next(node.children)
                .closeNode()
                .closeNode();
        },
    };
    serializer: NodeSerializerSpec = {
        match: (node) => node.type.name === this.id,
        runner: (state, node) => {
            state.openNode('tableCell').next(node.content).closeNode();
        },
    };
}

export class TableHeader extends Node {
    id = 'table_header';
    schema: NodeSpec = tableNodesSpec.table_header;
    parser: NodeParserSpec = {
        match: (node) => node.type === 'tableCell' && !!node.isHeader,
        runner: (state, node, type) => {
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
        runner: (state, node) => {
            state.openNode('tableCell');
            state.next(node.content);
            state.closeNode();
        },
    };
}

type Cls = new (...args: unknown[]) => unknown;
type ConstructorOf<T> = T extends InstanceType<infer U> ? U : T;

class NodeList<T extends Atom = Atom> extends Array<T> {
    configure<U extends ConstructorOf<T>>(Target: U, config: ConstructorParameters<U>[0]): this {
        const index = this.findIndex((x) => x.constructor === Target);
        if (index < 0) return this;

        this.splice(index, 1, new (Target as Cls & U)(config));

        return this;
    }

    static create<T extends Atom = Atom>(from: T[]): NodeList {
        return new NodeList(...from);
    }
}

export const tableNodes = NodeList.create([new Table(), new TableRow(), new TableCell(), new TableHeader()]);
