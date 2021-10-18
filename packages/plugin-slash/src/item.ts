/* Copyright 2021, Milkdown by Mirone. */
import type { Command } from '@milkdown/prose';
import type { Schema } from '@milkdown/prose';

import { cleanUpAndCreateNode } from './utility';

export type Action = {
    id: string;
    $: HTMLElement;
    keyword: string[];
    command: Command;
    enable: (schema: Schema) => boolean;
};

export type WrappedAction = Pick<Action, 'keyword' | 'id'> & {
    enable: (schema: Schema) => boolean;
    command: () => void;
    dom: HTMLElement;
};

export const transformAction = (action: WrappedAction): Action => ({
    id: action.id,
    keyword: action.keyword,
    $: action.dom,
    command: cleanUpAndCreateNode(action.command),
    enable: action.enable,
});
