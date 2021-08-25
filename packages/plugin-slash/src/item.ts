import type { Command } from 'prosemirror-commands';
import type { Schema } from 'prosemirror-model';

import { cleanUpAndCreateNode } from './utility';

export type Action = {
    $: HTMLElement;
    keyword: string[];
    command: Command;
    enable: (schema: Schema) => boolean;
};

export type WrappedAction = Pick<Action, 'keyword'> & {
    enable: (schema: Schema) => boolean;
    command: () => void;
    dom: HTMLElement;
};

export const transformAction = (action: WrappedAction): Action => ({
    keyword: action.keyword,
    $: action.dom,
    command: cleanUpAndCreateNode(action.command),
    enable: action.enable,
});
