import { LoadPluginContext } from '@milkdown/core';
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
    TaskList,
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
    command: (ctx: LoadPluginContext) => Command;
    enable: (ctx: LoadPluginContext) => boolean;
};

const cleanUpAndCreateNode =
    (fn: (ctx: LoadPluginContext) => Node, offset = 1): Action['command'] =>
    (ctx) =>
    (state, dispatch) => {
        if (!dispatch) return false;

        const { selection } = state;
        const { $head } = selection;
        const start = $head.pos - 1 - $head.parent.content.size;
        const tr = state.tr.replaceWith(start, $head.pos, fn(ctx));
        const pos = start + offset;
        const sel = TextSelection.create(tr.doc, pos);
        dispatch(tr.setSelection(sel));
        return true;
    };

const nodeExists = (name: string) => (ctx: LoadPluginContext) => Boolean(ctx.schema.nodes[name]);

export const items: Array<Action> = [
    {
        type: ActionType.H1,
        $: createDropdownItem('Large Heading', 'looks_one'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 1 })),
        keyword: ['h1', 'large heading'],
        enable: nodeExists('heading'),
    },
    {
        type: ActionType.H2,
        $: createDropdownItem('Medium Heading', 'looks_two'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 2 })),
        keyword: ['h2', 'medium heading'],
        enable: nodeExists('heading'),
    },
    {
        type: ActionType.H3,
        $: createDropdownItem('Small Heading', 'looks_3'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 3 })),
        keyword: ['h3', 'small heading'],
        enable: nodeExists('heading'),
    },
    {
        type: ActionType.BulletList,
        $: createDropdownItem('Bullet List', 'format_list_bulleted'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.bullet_list.createAndFill(null) as Node, 3),
        keyword: ['bullet list', 'ul'],
        enable: nodeExists('bullet_list'),
    },
    {
        type: ActionType.OrderedList,
        $: createDropdownItem('Ordered List', 'format_list_numbered'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.ordered_list.createAndFill(null) as Node, 3),
        keyword: ['ordered list', 'ol'],
        enable: nodeExists('ordered_list'),
    },
    {
        type: ActionType.TaskList,
        $: createDropdownItem('Task List', 'checklist'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.task_list_item.createAndFill(null) as Node, 3),
        keyword: ['task list', 'task'],
        enable: nodeExists('task_list_item'),
    },
    {
        type: ActionType.Image,
        $: createDropdownItem('Image', 'image'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.image.createAndFill({ src: '' }) as Node, 3),
        keyword: ['image'],
        enable: nodeExists('image'),
    },
    {
        type: ActionType.Quote,
        $: createDropdownItem('Quote', 'format_quote'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.blockquote.createAndFill(null) as Node, 2),
        keyword: ['quote', 'blockquote'],
        enable: nodeExists('blockquote'),
    },
    {
        type: ActionType.Table,
        $: createDropdownItem('Table', 'table_chart'),
        command: cleanUpAndCreateNode((ctx) => createTable(ctx.schema), 4),
        keyword: ['table'],
        enable: nodeExists('table'),
    },
    {
        type: ActionType.CodeFence,
        $: createDropdownItem('Code Fence', 'code'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.fence.createAndFill(null) as Node),
        keyword: ['code'],
        enable: nodeExists('fence'),
    },
    {
        type: ActionType.DivideLine,
        $: createDropdownItem('Divide Line', 'horizontal_rule'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.hr.create()),
        keyword: ['divider', 'hr'],
        enable: nodeExists('hr'),
    },
];
