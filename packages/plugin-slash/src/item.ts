import { PluginReadyContext } from '@milkdown/core';
import { createTable } from '@milkdown/plugin-table';
import type { Command } from 'prosemirror-commands';
import type { Node } from 'prosemirror-model';
import { TextSelection } from 'prosemirror-state';
import { createDropdownItem } from './utility';

export enum ActionType {
    Divider,
    H1,
    H2,
    H3,
    BulletList,
    OrderedList,
    Quote,
    CodeFence,
    Table,
    DivideLine,
    Image,
}

export type Divider = {
    type: ActionType.Divider;
};

export type Action = {
    type: Omit<ActionType, ActionType.Divider>;
    $: HTMLElement;
    keyword: string[];
    command: (ctx: PluginReadyContext) => Command;
};

const cleanUpAndCreateNode = (fn: (ctx: PluginReadyContext) => Node): Action['command'] => (ctx) => (
    state,
    dispatch,
) => {
    if (!dispatch) return false;

    const { selection } = state;
    const { $head } = selection;
    const start = $head.pos - 1 - $head.parent.content.size;
    const tr = state.tr.replaceWith(start, $head.pos, fn(ctx));
    const pos = $head.pos - 1 - $head.parent.content.size + 1;
    const sel = TextSelection.create(tr.doc, pos);
    dispatch(tr.setSelection(sel));
    return true;
};

export const items: Array<Action> = [
    {
        type: ActionType.H1,
        $: createDropdownItem('Large Heading', 'looks_one'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 1 })),
        keyword: ['h1', 'large heading'],
    },
    {
        type: ActionType.H2,
        $: createDropdownItem('Medium Heading', 'looks_two'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 2 })),
        keyword: ['h2', 'medium heading'],
    },
    {
        type: ActionType.H3,
        $: createDropdownItem('Small Heading', 'looks_3'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 3 })),
        keyword: ['h3', 'small heading'],
    },
    {
        type: ActionType.BulletList,
        $: createDropdownItem('Bullet List', 'format_list_bulleted'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.bullet_list.createAndFill(null) as Node),
        keyword: ['bullet list', 'ul'],
    },
    {
        type: ActionType.OrderedList,
        $: createDropdownItem('Ordered List', 'format_list_numbered'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.ordered_list.createAndFill(null) as Node),
        keyword: ['ordered list', 'ol'],
    },
    {
        type: ActionType.Image,
        $: createDropdownItem('Image', 'image'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.image.createAndFill({ src: '' }) as Node),
        keyword: ['image'],
    },
    {
        type: ActionType.Quote,
        $: createDropdownItem('Quote', 'format_quote'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.blockquote.createAndFill(null) as Node),
        keyword: ['quote', 'blockquote'],
    },
    {
        type: ActionType.Table,
        $: createDropdownItem('Table', 'table_chart'),
        command: cleanUpAndCreateNode((ctx) => createTable(ctx.schema)),
        keyword: ['table'],
    },
    {
        type: ActionType.CodeFence,
        $: createDropdownItem('Code Fence', 'developer_mode'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.fence.createAndFill(null) as Node),
        keyword: ['code'],
    },
    {
        type: ActionType.DivideLine,
        $: createDropdownItem('Divide Line', 'horizontal_rule'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.hr.create()),
        keyword: ['divider', 'hr'],
    },
];
