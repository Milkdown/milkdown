import type { Command } from 'prosemirror-commands';
import type { Node, Schema } from 'prosemirror-model';
import { cleanUpAndCreateNode, createDropdownItem, nodeExists } from './utility';

export type Action = {
    $: HTMLElement;
    keyword: string[];
    command: (schema: Schema) => Command;
    enable: (schema: Schema) => boolean;
};

export type WrappedAction = Pick<Action, 'keyword'> & {
    nodeName: string;
    onCreate: (schema: Schema) => Node;
    $: [text: string, icon: string];
};

export const transformAction = (action: WrappedAction): Action => ({
    keyword: action.keyword,
    $: createDropdownItem(...action.$),
    command: cleanUpAndCreateNode(action.onCreate),
    enable: nodeExists(action.nodeName),
});
