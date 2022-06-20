/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils';

import type { Config } from './config';
import { defaultConfig } from './config';
import { createSlashPlugin } from './prose-plugin';

export type { Config, StatusConfig, StatusConfigBuilder, StatusConfigBuilderParams } from './config';
export { defaultActions, defaultConfig } from './config';
export type { Action, WrappedAction } from './item';
export { createDropdownItem } from './utility';

export type Options = {
    config: Config;
};

export const slashPlugin = createPlugin<string, Options>((utils, options) => {
    const slashConfig = options?.config ?? defaultConfig;

    return {
        prosePlugins: (_, ctx) => {
            const config = slashConfig(ctx);

            const plugin = createSlashPlugin(utils, config, 'slash-dropdown');

            return [plugin];
        },
    };
});

export const slash = AtomList.create([slashPlugin()]);
