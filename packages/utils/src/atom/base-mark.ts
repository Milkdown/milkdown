import { Mark, markFactory } from '@milkdown/core';
import { UnknownRecord } from '../type-utility';
import { commonPlugin } from './base-common';
import { Factory, Origin, PluginWithMetadata } from './types';

export const createMark = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, Mark>,
): Origin<Mark, SupportedKeys, T> => {
    const origin: Origin<Mark, SupportedKeys, T> = (options) => {
        const plugin = markFactory((ctx) => commonPlugin(factory, ctx, options)) as PluginWithMetadata<
            Mark,
            SupportedKeys,
            T
        >;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
