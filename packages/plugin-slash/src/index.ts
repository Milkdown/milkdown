/* Copyright 2021, Milkdown by Mirone. */
import { AtomList, createPlugin } from '@milkdown/utils';

import type { Config } from './config';
import { defaultConfig } from './config';
import { createSlashPlugin } from './prose-plugin';

export { Config, defaultActions, defaultConfig, StatusConfig } from './config';
export { CursorStatus } from './prose-plugin/status';
export { createDropdownItem, nodeExists } from './utility';

export type Options = {
    config: Config;
};

export const slashPlugin = createPlugin<string, Options>((utils, options) => {
    const slashConfig = options?.config ?? defaultConfig;

    return {
        prosePlugins: (_, ctx) => {
            const configurations = slashConfig(ctx);
            const plugin = createSlashPlugin(utils, configurations);

            return [plugin];
        },
    };
});

export const slash = AtomList.create([slashPlugin()]);
