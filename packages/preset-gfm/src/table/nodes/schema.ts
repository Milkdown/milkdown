/* Copyright 2021, Milkdown by Mirone. */
import { Attrs, Node, NodeSpec, Schema } from '@milkdown/prose/model';

import { TableNodesOptions } from './types';

function getCellAttrs(dom: HTMLElement, extraAttrs: Attrs) {
    const widthAttr = dom.getAttribute('data-colwidth');
    const widths = widthAttr && /^\d+(,\d+)*$/.test(widthAttr) ? widthAttr.split(',').map((s) => Number(s)) : null;
    const colspan = Number(dom.getAttribute('colspan') || 1);
    const result = {
        colspan,
        rowspan: Number(dom.getAttribute('rowspan') || 1),
        colwidth: widths && widths.length == colspan ? widths : null,
    };
    for (const prop in extraAttrs) {
        const getter = extraAttrs[prop].getFromDOM;
        const value = getter && getter(dom);
        if (value != null) result[prop as keyof typeof result] = value;
    }
    return result;
}

function setCellAttrs(node: Node, extraAttrs: Attrs) {
    const attrs: Record<string, unknown> = {};
    if (node.attrs['colspan'] != 1) attrs['colspan'] = node.attrs['colspan'];
    if (node.attrs['rowspan'] != 1) attrs['rowspan'] = node.attrs['rowspan'];
    if (node.attrs['colwidth']) attrs['data-colwidth'] = node.attrs['colwidth'].join(',');
    for (const prop in extraAttrs) {
        const setter = extraAttrs[prop].setDOMAttr;
        if (setter) setter(node.attrs[prop], attrs);
    }
    return attrs;
}

function tableNodesSpecCreator(options: TableNodesOptions) {
    const extraAttrs: Attrs = options.cellAttributes || {};
    const cellAttrs: Record<string, unknown> = {
        colspan: { default: 1 },
        rowspan: { default: 1 },
        colwidth: { default: null },
    };
    for (const prop in extraAttrs) cellAttrs[prop] = { default: extraAttrs[prop].default };
    const finalAttrs = cellAttrs as Attrs;

    const schema: Record<'table' | 'table_row' | 'table_cell' | 'table_header', NodeSpec> = {
        table: {
            content: 'table_row+',
            tableRole: 'table',
            isolating: true,
            group: options.tableGroup,
            parseDOM: [{ tag: 'table' }],
            toDOM() {
                return ['table', ['tbody', 0]];
            },
        },
        table_row: {
            content: '(table_cell | table_header)*',
            tableRole: 'row',
            parseDOM: [{ tag: 'tr' }],
            toDOM() {
                return ['tr', 0];
            },
        },
        table_cell: {
            content: options.cellContent,
            attrs: finalAttrs,
            tableRole: 'cell',
            isolating: true,
            parseDOM: [{ tag: 'td', getAttrs: (dom) => getCellAttrs(dom as HTMLElement, extraAttrs) }],
            toDOM(node) {
                return ['td', setCellAttrs(node, extraAttrs), 0];
            },
        },
        table_header: {
            content: options.cellContent,
            attrs: finalAttrs,
            tableRole: 'header_cell',
            isolating: true,
            parseDOM: [{ tag: 'th', getAttrs: (dom) => getCellAttrs(dom as HTMLElement, extraAttrs) }],
            toDOM(node) {
                return ['th', setCellAttrs(node, extraAttrs), 0];
            },
        },
    };

    return schema;
}

export function tableNodeTypes(schema: Schema) {
    let result = schema.cached['tableNodeTypes'];
    if (!result) {
        result = schema.cached['tableNodeTypes'] = {};
        for (const name in schema.nodes) {
            const type = schema.nodes[name],
                role = type?.spec['tableRole'];
            if (role) result[role] = type;
        }
    }
    return result;
}

export const schema = tableNodesSpecCreator({
    tableGroup: 'block',
    cellContent: 'paragraph',
    cellAttributes: {
        alignment: {
            default: 'left',
            getFromDOM: (dom) => (dom as HTMLElement).style.textAlign || 'left',
            setDOMAttr: (value, attrs) => {
                attrs['style'] = `text-align: ${value || 'left'}`;
            },
        },
    },
});
