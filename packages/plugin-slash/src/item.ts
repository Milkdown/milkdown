/* Copyright 2021, Milkdown by Mirone. */
import type { Command } from '@milkdown/prose/state';

import { cleanUpAndCreateNode } from './utility';

export type Action = {
    id: string;
    $: HTMLElement;
    command: Command;
};

export type WrappedAction = Pick<Action, 'id'> & {
    command: () => void;
    dom: HTMLElement;
};

export const transformAction = (action: WrappedAction): Action => ({
    id: action.id,
    $: action.dom,
    command: cleanUpAndCreateNode(action.command),
});
