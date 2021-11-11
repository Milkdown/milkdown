/* Copyright 2021, Milkdown by Mirone. */
import type { Command } from '@milkdown/prose';

import { cleanUpAndCreateNode } from './utility';

export type Action = {
    id: string;
    $: HTMLElement;
    keyword: string[];
    command: Command;
};

export type WrappedAction = Pick<Action, 'keyword' | 'id'> & {
    command: () => void;
    dom: HTMLElement;
};

export const transformAction = (action: WrappedAction): Action => ({
    id: action.id,
    keyword: action.keyword,
    $: action.dom,
    command: cleanUpAndCreateNode(action.command),
});
