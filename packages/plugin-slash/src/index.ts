/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { EditorState, NodeWithPos } from '@milkdown/prose';
import { AtomList, createPlugin } from '@milkdown/utils';

import { config } from './config';
import { WrappedAction } from './item';
import { createSlashPlugin } from './prose-plugin';
import { CursorStatus } from './prose-plugin/status';

export { config } from './config';
export { CursorStatus } from './prose-plugin/status';
export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (ctx: Ctx) => WrappedAction[];

export type Options = {
    shouldDisplay: (parent: NodeWithPos, state: EditorState) => boolean;
    config: SlashConfig;
    placeholder: {
        [CursorStatus.Empty]: string;
        [CursorStatus.Slash]: string;
    };
};

export const slashPlugin = createPlugin<string, Options>((utils, options) => {
    const slashConfig = options?.config ?? config;
    const placeholder = {
        [CursorStatus.Empty]: 'Type / to use the slash commands...',
        [CursorStatus.Slash]: 'Type to filter...',
        ...(options?.placeholder ?? {}),
    };

    return {
        prosePlugins: (_, ctx) => {
            const cfg = slashConfig(ctx);
            const shouldDisplay =
                options?.shouldDisplay ??
                ((parent, state) => {
                    const isTopLevel = state.selection.$from.depth === 1;
                    return parent.node.childCount <= 1 && isTopLevel;
                });
            const plugin = createSlashPlugin(utils, cfg, placeholder, shouldDisplay);

            return [plugin];
        },
    };
});

export const slash = AtomList.create([slashPlugin()]);
