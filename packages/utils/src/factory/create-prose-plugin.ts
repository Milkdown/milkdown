/* Copyright 2021, Milkdown by Mirone. */
import { prosePluginFactory } from '@milkdown/core';
import type { Plugin } from '@milkdown/prose';

import { ExtendFactory, Factory, Origin, PluginWithMetadata, UnknownRecord } from '../types';
import { commonPlugin } from './common';

type PluginData = {
    id: string;
    plugin: Plugin | Plugin[];
};

export const createProsePlugin = <Obj extends UnknownRecord = UnknownRecord>(
    factory: Factory<string, Obj, PluginData>,
): Origin<string, Obj, PluginData> => {
    const origin: Origin<string, Obj, PluginData> = (options) => {
        const plugin = prosePluginFactory((ctx) => {
            const pluginData = commonPlugin(factory, ctx, options);
            plugin.id = pluginData.id;
            return pluginData.plugin;
        }) as PluginWithMetadata<string, Obj, PluginData>;
        plugin.origin = origin;

        return plugin;
    };
    origin.extend = <ObjExtended extends Obj = Obj>(
        extendFactory: ExtendFactory<string, string, ObjExtended, PluginData>,
    ) => {
        return createProsePlugin<ObjExtended>((options, utils) => {
            const original = factory(options as Obj, utils);
            return extendFactory(options, utils, original);
        });
    };

    return origin;
};
