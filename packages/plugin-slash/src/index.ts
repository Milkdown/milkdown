/* Copyright 2021, Milkdown by Mirone. */
import { createPlugin } from '@milkdown/utils';

import type { Config } from './config';
import { defaultConfig } from './config';
import { createSlashPlugin } from './prose-plugin';

export type { Config, StatusConfig, StatusConfigBuilder, StatusConfigBuilderParams } from './config';
export { defaultActions, defaultConfig } from './config';
export { createDropdownItem } from './utility';

export type Options = {
    config: Config;
    className: string;
};

export const slash = createPlugin<string, Options>((utils, options) => {
    const slashConfig = options?.config ?? defaultConfig;

    return {
        prosePlugins: (_, ctx) => {
            const config = slashConfig(ctx);

            const plugin = createSlashPlugin(utils, config, options?.className ?? 'slash-dropdown');

            return [plugin];
        },
    };
});
