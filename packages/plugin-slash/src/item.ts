import type { Command } from 'prosemirror-commands';
import { createDropdownItem } from './utility';
import { PluginReadyContext } from '@milkdown/core';
import { TextSelection } from 'prosemirror-state';
import type { Node } from 'prosemirror-model';

export enum ActionType {
    Divider,
    H1,
    H2,
    H3,
    BulletList,
    OrderedList,
    Quote,
}

export type Divider = {
    type: ActionType.Divider;
};

export type Action = {
    type: Omit<ActionType, ActionType.Divider>;
    $: HTMLElement;
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
    },
    {
        type: ActionType.H2,
        $: createDropdownItem('Medium Heading', 'looks_two'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 2 })),
    },
    {
        type: ActionType.H3,
        $: createDropdownItem('Small Heading', 'looks_3'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.heading.create({ level: 3 })),
    },
    {
        type: ActionType.BulletList,
        $: createDropdownItem('Bullet List', 'format_list_bulleted'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.bullet_list.createAndFill(null) as Node),
    },
    {
        type: ActionType.OrderedList,
        $: createDropdownItem('Ordered List', 'format_list_numbered'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.ordered_list.createAndFill(null) as Node),
    },
    {
        type: ActionType.Quote,
        $: createDropdownItem('Quote', 'format_quote'),
        command: cleanUpAndCreateNode((ctx) => ctx.schema.nodes.blockquote.createAndFill(null) as Node),
    },
];
