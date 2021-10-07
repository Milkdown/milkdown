/* Copyright 2021, Milkdown by Mirone. */
import { prosePluginFactory } from '@milkdown/core';
import type { Plugin } from 'prosemirror-state';

import { UnknownRecord } from '../type-utility';
import { commonPlugin } from './base-common';
import { Factory, Origin, PluginWithMetadata } from './types';

export const createProsePlugin = <Obj extends UnknownRecord = UnknownRecord>(
    factory: Factory<string, Obj, { plugin: Plugin | Plugin[]; id: string }>,
): Origin<string, Obj, Plugin> => {
    const origin: Origin<string, Obj, Plugin | Plugin[]> = (options) => {
        const plugin = prosePluginFactory((ctx) => {
            const output = commonPlugin(factory, ctx, options);
            plugin.id = output.id;
            return output.plugin;
        }) as PluginWithMetadata<string, Obj>;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
