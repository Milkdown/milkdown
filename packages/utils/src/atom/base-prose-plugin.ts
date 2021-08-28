import { prosePluginFactory } from '@milkdown/core';
import type { Plugin } from 'prosemirror-state';

import { UnknownRecord } from '../type-utility';
import { commonPlugin } from './base-common';
import { Factory, Origin, PluginWithMetadata } from './types';

export const createProsePlugin = <Obj extends UnknownRecord = UnknownRecord>(
    factory: Factory<string, Obj, Plugin>,
): Origin<string, Obj, Plugin> => {
    const origin: Origin<string, Obj, Plugin> = (options) => {
        const plugin = prosePluginFactory((ctx) => commonPlugin(factory, ctx, options)) as PluginWithMetadata<
            string,
            Obj
        >;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
