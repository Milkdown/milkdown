import type { Command } from 'prosemirror-commands';
import { createDropdownItem } from './utility';
import { PluginReadyContext } from '@milkdown/core';
import { TextSelection } from 'prosemirror-state';

export enum ActionType {
    Divider,
    H1,
    H2,
    H3,
}

export type Divider = {
    type: ActionType.Divider;
};

export type Action = {
    type: Omit<ActionType, ActionType.Divider>;
    $: HTMLElement;
    command: (ctx: PluginReadyContext) => Command;
};

export const items: Array<Action> = [
    {
        type: ActionType.H1,
        $: createDropdownItem('h1', 'Heading'),
        command: (ctx) => (state, dispatch) => {
            if (!dispatch) return false;

            const { selection } = state;
            const { $head } = selection;
            const tr = state.tr.replaceWith(
                $head.pos - 1 - $head.parent.content.size,
                $head.pos,
                ctx.schema.nodes.heading.create({ level: 1 }),
            );
            const pos = $head.pos - 1 - $head.parent.content.size + 1;
            const sel = TextSelection.create(tr.doc, pos);
            dispatch(tr.setSelection(sel));
            return true;
        },
    },
];
