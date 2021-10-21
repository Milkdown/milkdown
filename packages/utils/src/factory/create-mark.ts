/* Copyright 2021, Milkdown by Mirone. */
import { Mark, markFactory } from '@milkdown/core';

import { Factory, Origin, PluginWithMetadata, UnknownRecord } from '../types';
import { commonPlugin } from './common';
import { createKeymap } from './keymap';

export const createMark = <SupportedKeys extends string = string, T extends UnknownRecord = UnknownRecord>(
    factory: Factory<SupportedKeys, T, Mark>,
): Origin<SupportedKeys, T, Mark> => {
    const origin: Origin<SupportedKeys, T, Mark> = (options) => {
        const plugin = markFactory((ctx) => {
            const mark = commonPlugin(factory, ctx, options);
            const view = options?.view ?? mark.view;
            const keymap = createKeymap(mark.shortcuts, options?.keymap);
            plugin.id = mark.id;

            return {
                ...mark,
                view,
                keymap,
            };
        }) as PluginWithMetadata<SupportedKeys, T, Mark>;
        plugin.origin = origin;

        return plugin;
    };

    return origin;
};
