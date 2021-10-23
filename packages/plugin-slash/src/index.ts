/* Copyright 2021, Milkdown by Mirone. */
import { EditorState, NodeWithPos } from '@milkdown/prose';
import { AtomList, createProsePlugin, Utils } from '@milkdown/utils';

import { config } from './config';
import { WrappedAction } from './item';
import { createSlashPlugin } from './prose-plugin';
import { CursorStatus } from './prose-plugin/status';

export { config } from './config';
export { CursorStatus } from './prose-plugin/status';
export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (utils: Utils) => WrappedAction[];

export type Options = {
    shouldDisplay: (parent: NodeWithPos, state: EditorState) => boolean;
    config: SlashConfig;
    placeholder: {
        [CursorStatus.Empty]: string;
        [CursorStatus.Slash]: string;
    };
};

export const slashPlugin = createProsePlugin<Options>((options, utils) => {
    const slashConfig = options?.config ?? config;
    const placeholder = {
        [CursorStatus.Empty]: 'Type / to use the slash commands...',
        [CursorStatus.Slash]: 'Type to filter...',
        ...(options?.placeholder ?? {}),
    };
    const cfg = slashConfig(utils);
    const shouldDisplay =
        options?.shouldDisplay ??
        ((parent, state) => {
            const isTopLevel = state.selection.$from.depth === 1;
            return parent.node.childCount <= 1 && isTopLevel;
        });

    const plugin = createSlashPlugin(utils, cfg, placeholder, shouldDisplay);
    return {
        id: 'slash',
        plugin,
    };
});

export const slash = AtomList.create([slashPlugin()]);
