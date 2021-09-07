/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createProsePlugin, Utils } from '@milkdown/utils';

import { config } from './config';
import { WrappedAction } from './item';
import { createSlashPlugin } from './prose-plugin';

export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (utils: Utils) => WrappedAction[];

export { config } from './config';
export const slashPlugin = createProsePlugin<{ config: SlashConfig }>((options, utils) => {
    const slashConfig = options?.config ?? config;
    const cfg = slashConfig(utils);

    return createSlashPlugin(utils, cfg);
});

export const slash = AtomList.create([slashPlugin()]);
