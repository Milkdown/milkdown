/* Copyright 2021, Milkdown by Mirone. */
import { Ctx } from '@milkdown/core';
import { AtomList, createProsePlugin } from '@milkdown/utils';

import { config } from './config';
import { WrappedAction } from './item';
import { createSlashPlugin } from './prose-plugin';

export { createDropdownItem, nodeExists } from './utility';

export type SlashConfig = (ctx: Ctx) => WrappedAction[];

const slashPlugin = createProsePlugin<{ config: SlashConfig }>((options, utils) => {
    const slashConfig = options?.config ?? config;
    const cfg = slashConfig(utils.ctx);

    return createSlashPlugin(utils, cfg);
});

export const slash = AtomList.create([slashPlugin()]);
