import type { Command } from 'prosemirror-commands';
import type { Node, Schema } from 'prosemirror-model';
import { cleanUpAndCreateNode } from './utility';

export type Action = {
    $: HTMLElement;
    keyword: string[];
    command: (schema: Schema) => Command;
    enable: (schema: Schema) => boolean;
};

export type WrappedAction = Pick<Action, 'keyword'> & {
    enable: (schema: Schema) => boolean;
    onCreate: (schema: Schema) => Node;
    dom: HTMLElement;
    selectionType?: 'node' | 'text';
};

export const transformAction = (action: WrappedAction): Action => ({
    keyword: action.keyword,
    $: action.dom,
    command: cleanUpAndCreateNode(action.onCreate, action.selectionType),
    enable: action.enable,
});
