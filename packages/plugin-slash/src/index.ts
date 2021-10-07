/* Copyright 2021, Milkdown by Mirone. */
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

    const plugin = createSlashPlugin(utils, cfg, placeholder);
    return {
        id: 'slash',
        plugin,
    };
});

export const slash = AtomList.create([slashPlugin()]);
